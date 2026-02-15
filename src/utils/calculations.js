/**
 * Calculate analytics metrics from trades
 */

import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

/**
 * Calculate overall statistics
 * @param {Array} trades - Array of closed trades
 * @returns {Object} - Statistics object
 */
export const calculateStats = (trades) => {
    const closedTrades = trades.filter((t) => t.status === 'CLOSED' && t.netPnL !== undefined);

    if (closedTrades.length === 0) {
        return {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            winRate: 0,
            totalPnL: 0,
            grossProfit: 0,
            grossLoss: 0,
            avgWin: 0,
            avgLoss: 0,
            profitFactor: 0,
            expectancy: 0,
            largestWin: 0,
            largestLoss: 0,
            avgTradeReturn: 0,
            totalCharges: 0,
        };
    }

    const winners = closedTrades.filter((t) => t.netPnL > 0);
    const losers = closedTrades.filter((t) => t.netPnL < 0);

    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.netPnL || 0), 0);
    const grossProfit = winners.reduce((sum, t) => sum + t.netPnL, 0);
    const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.netPnL, 0));
    const totalCharges = closedTrades.reduce((sum, t) => sum + (t.charges?.total || 0), 0);

    const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
    const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    const winRate = (winners.length / closedTrades.length) * 100;
    const expectancy = closedTrades.length > 0 ? totalPnL / closedTrades.length : 0;

    const allPnLs = closedTrades.map((t) => t.netPnL);
    const largestWin = Math.max(...allPnLs, 0);
    const largestLoss = Math.min(...allPnLs, 0);

    // Helper to get capital used (fallback for older trades)
    const getCapital = (t) => t.capitalUsed || (t.entryPrice * t.lotSize * t.quantity) || 0;

    // Helper to get percentage return (fallback for older trades - using Net P&L for better accuracy here)
    const getReturn = (t) => {
        if (t.percentageReturn !== undefined) return t.percentageReturn;
        const cap = getCapital(t);
        return cap > 0 ? (t.netPnL / cap) * 100 : 0;
    };

    const totalPercentageReturn = closedTrades.reduce((sum, t) => sum + getReturn(t), 0);
    const avgProfitPercentPerTrade = closedTrades.length > 0 ? totalPercentageReturn / closedTrades.length : 0;

    const totalCapitalUsed = closedTrades.reduce((sum, t) => sum + getCapital(t), 0);
    const avgCapitalPerTrade = closedTrades.length > 0 ? totalCapitalUsed / closedTrades.length : 0;

    // Calculate Average Daily Return %
    const dailyReturns = {};
    closedTrades.forEach(trade => {
        if (trade.exitDate) {
            if (!dailyReturns[trade.exitDate]) {
                dailyReturns[trade.exitDate] = { pnl: 0, capital: 0 };
            }
            dailyReturns[trade.exitDate].pnl += trade.netPnL || 0;
            dailyReturns[trade.exitDate].capital += getCapital(trade);
        }
    });

    const dailyReturnPercents = Object.values(dailyReturns).map(day =>
        day.capital > 0 ? (day.pnl / day.capital) * 100 : 0
    );

    const avgDailyReturn = dailyReturnPercents.length > 0
        ? dailyReturnPercents.reduce((sum, val) => sum + val, 0) / dailyReturnPercents.length
        : 0;

    return {
        totalTrades: closedTrades.length,
        winningTrades: winners.length,
        losingTrades: losers.length,
        winRate: Math.round(winRate * 100) / 100,
        totalPnL: Math.round(totalPnL * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        grossLoss: Math.round(grossLoss * 100) / 100,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        profitFactor: profitFactor === Infinity ? '∞' : Math.round(profitFactor * 100) / 100,
        expectancy: Math.round(expectancy * 100) / 100,
        largestWin: Math.round(largestWin * 100) / 100,
        largestLoss: Math.round(largestLoss * 100) / 100,
        avgTradeReturn: Math.round((totalPnL / closedTrades.length) * 100) / 100,
        totalCharges: Math.round(totalCharges * 100) / 100,
        avgProfitPercentPerTrade: Math.round(avgProfitPercentPerTrade * 100) / 100,
        avgCapitalPerTrade: Math.round(avgCapitalPerTrade * 100) / 100,
        avgDailyReturn: Math.round(avgDailyReturn * 100) / 100,
    };
};

/**
 * Group trades by a field and calculate P&L
 * @param {Array} trades - Array of trades
 * @param {string} field - Field to group by
 * @returns {Array} - Array of { name, pnl, count }
 */
export const groupByField = (trades, field) => {
    const groups = {};

    trades.forEach((trade) => {
        const key = trade[field] || 'Unknown';
        if (!groups[key]) {
            groups[key] = { name: key, pnl: 0, count: 0, wins: 0 };
        }
        groups[key].pnl += trade.netPnL || 0;
        groups[key].count++;
        if (trade.netPnL > 0) groups[key].wins++;
    });

    return Object.values(groups)
        .map((g) => ({
            ...g,
            pnl: Math.round(g.pnl * 100) / 100,
            winRate: g.count > 0 ? Math.round((g.wins / g.count) * 100) : 0,
        }))
        .sort((a, b) => b.pnl - a.pnl);
};

/**
 * Get P&L by date for a time range
 * @param {Array} trades - Array of trades
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Array of { date, pnl, cumulativePnL }
 */
export const getPnLByDate = (trades, startDate, endDate) => {
    const closedTrades = trades.filter(
        (t) => t.status === 'CLOSED' && t.exitDate
    );

    // Group by exit date
    const dailyPnL = {};
    closedTrades.forEach((trade) => {
        const date = trade.exitDate;
        if (!dailyPnL[date]) {
            dailyPnL[date] = 0;
        }
        dailyPnL[date] += trade.netPnL || 0;
    });

    // Create array with all dates in range
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let cumulative = 0;

    return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const pnl = dailyPnL[dateStr] || 0;
        cumulative += pnl;

        return {
            date: dateStr,
            displayDate: format(day, 'MMM dd'),
            pnl: Math.round(pnl * 100) / 100,
            cumulativePnL: Math.round(cumulative * 100) / 100,
        };
    });
};

/**
 * Get calendar heatmap data for a month
 * @param {Array} trades - Array of trades
 * @param {Date} month - Any date in the target month
 * @returns {Array} - Array of { date, pnl, tradeCount }
 */
export const getCalendarData = (trades, month) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const closedTrades = trades.filter(
        (t) => t.status === 'CLOSED' && t.exitDate
    );

    return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTrades = closedTrades.filter((t) => t.exitDate === dateStr);
        const pnl = dayTrades.reduce((sum, t) => sum + (t.netPnL || 0), 0);

        return {
            date: day,
            dateStr,
            day: format(day, 'd'),
            pnl: Math.round(pnl * 100) / 100,
            tradeCount: dayTrades.length,
            trades: dayTrades,
        };
    });
};

/**
 * Get monthly summary
 * @param {Array} trades - Array of trades  
 * @returns {Array} - Array of { month, pnl, tradeCount, winRate }
 */
export const getMonthlySummary = (trades) => {
    const closedTrades = trades.filter((t) => t.status === 'CLOSED' && t.exitDate);
    const months = {};

    closedTrades.forEach((trade) => {
        const monthKey = trade.exitDate.substring(0, 7); // YYYY-MM
        if (!months[monthKey]) {
            months[monthKey] = { pnl: 0, count: 0, wins: 0 };
        }
        months[monthKey].pnl += trade.netPnL || 0;
        months[monthKey].count++;
        if (trade.netPnL > 0) months[monthKey].wins++;
    });

    return Object.entries(months)
        .map(([month, data]) => ({
            month,
            displayMonth: format(parseISO(month + '-01'), 'MMM yyyy'),
            pnl: Math.round(data.pnl * 100) / 100,
            tradeCount: data.count,
            winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
        }))
        .sort((a, b) => b.month.localeCompare(a.month));
};

/**
 * Get day of week analysis
 * @param {Array} trades - Array of trades
 * @returns {Array} - Array of { day, pnl, count, winRate }
 */
export const getDayOfWeekAnalysis = (trades) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = days.map((name) => ({ name, pnl: 0, count: 0, wins: 0 }));

    const closedTrades = trades.filter((t) => t.status === 'CLOSED' && t.exitDate);

    closedTrades.forEach((trade) => {
        const dayIndex = parseISO(trade.exitDate).getDay();
        dayData[dayIndex].pnl += trade.netPnL || 0;
        dayData[dayIndex].count++;
        if (trade.netPnL > 0) dayData[dayIndex].wins++;
    });

    return dayData
        .filter((d) => d.count > 0)
        .map((d) => ({
            ...d,
            pnl: Math.round(d.pnl * 100) / 100,
            winRate: Math.round((d.wins / d.count) * 100),
        }));
};

/**
 * Calculate max drawdown
 * @param {Array} trades - Array of trades sorted by exit date
 * @returns {Object} - { maxDrawdown, maxDrawdownPercent }
 */
export const calculateDrawdown = (trades) => {
    const closedTrades = trades
        .filter((t) => t.status === 'CLOSED' && t.exitDate)
        .sort((a, b) => a.exitDate.localeCompare(b.exitDate));

    if (closedTrades.length === 0) {
        return { maxDrawdown: 0, maxDrawdownPercent: 0 };
    }

    let peak = 0;
    let cumulative = 0;
    let maxDrawdown = 0;

    closedTrades.forEach((trade) => {
        cumulative += trade.netPnL || 0;
        if (cumulative > peak) {
            peak = cumulative;
        }
        const drawdown = peak - cumulative;
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    });

    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    return {
        maxDrawdown: Math.round(maxDrawdown * 100) / 100,
        maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
    };
};
