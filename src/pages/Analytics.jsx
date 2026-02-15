import { useMemo, useState } from 'react';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Button, Card, CardTitle, Select } from '../components/common';
import { MetricsGrid, PnLChart, BreakdownChart, TradingCalendar, WeeklyGoalChart } from '../components/analytics';
import { useTrades } from '../context/TradesContext';
import {
    calculateStats,
    getPnLByDate,
    groupByField,
    getCalendarData,
    getDayOfWeekAnalysis,
    getMonthlySummary,
    calculateDrawdown
} from '../utils/calculations';

const timeRanges = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
];

const Analytics = () => {
    const { trades, loading } = useTrades();
    const [timeRange, setTimeRange] = useState('30');

    // Filter trades by time range
    const filteredTrades = useMemo(() => {
        if (timeRange === 'all') return trades;

        const days = parseInt(timeRange);
        const cutoffDate = subDays(new Date(), days).toISOString().split('T')[0];

        return trades.filter(trade =>
            (trade.exitDate || trade.entryDate) >= cutoffDate
        );
    }, [trades, timeRange]);

    // Calculate all analytics
    const stats = useMemo(() => {
        const s = calculateStats(filteredTrades);
        const d = calculateDrawdown(filteredTrades);
        return { ...s, ...d };
    }, [filteredTrades]);

    const pnlData = useMemo(() => {
        const endDate = new Date();
        const days = timeRange === 'all' ? 365 : parseInt(timeRange);
        const startDate = subDays(endDate, days);
        return getPnLByDate(filteredTrades, startDate, endDate);
    }, [filteredTrades, timeRange]);

    const byUnderlying = useMemo(() =>
        groupByField(filteredTrades.filter(t => t.status === 'CLOSED'), 'underlying').slice(0, 10),
        [filteredTrades]
    );

    const byChannel = useMemo(() =>
        groupByField(filteredTrades.filter(t => t.status === 'CLOSED'), 'channel'),
        [filteredTrades]
    );

    const byDayOfWeek = useMemo(() => getDayOfWeekAnalysis(filteredTrades), [filteredTrades]);

    const calendarData = useMemo(() => getCalendarData(trades, new Date()), [trades]);

    const monthlySummary = useMemo(() => getMonthlySummary(trades).slice(0, 6), [trades]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-slate-400">Deep dive into your trading performance</p>
                </div>
                <div className="w-48">
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        options={timeRanges}
                    />
                </div>
            </div>

            {trades.length === 0 ? (
                <Card className="text-center py-16">
                    <p className="text-slate-400">No trades to analyze. Add some trades first!</p>
                </Card>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <MetricsGrid stats={stats} />

                    {/* Weekly Goals */}
                    <WeeklyGoalChart trades={trades} />

                    {/* P&L Chart */}
                    <PnLChart data={pnlData} title={`Cumulative P&L - ${timeRanges.find(t => t.value === timeRange)?.label}`} />

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <BreakdownChart
                            data={byUnderlying}
                            title="P&L by Underlying (Top 10)"
                        />
                        <BreakdownChart
                            data={byChannel}
                            title="P&L by Trade Channel"
                        />
                    </div>

                    {/* Day of Week Analysis */}
                    <Card>
                        <CardTitle className="mb-4">Performance by Day of Week</CardTitle>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            {byDayOfWeek.map((day) => (
                                <div
                                    key={day.name}
                                    className={`p-4 rounded-lg text-center ${day.pnl >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                        }`}
                                >
                                    <p className="text-slate-400 text-sm">{day.name}</p>
                                    <p className={`text-lg font-bold ${day.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        {day.pnl >= 0 ? '+' : ''}{(day.pnl / 1000).toFixed(1)}k
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {day.count} trades • {day.winRate}% win
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Calendar */}
                    <TradingCalendar trades={trades} />

                    {/* Monthly Summary */}
                    <Card>
                        <CardTitle className="mb-4">Monthly Summary</CardTitle>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                                        <th className="pb-3 font-medium">Month</th>
                                        <th className="pb-3 font-medium">P&L</th>
                                        <th className="pb-3 font-medium">Trades</th>
                                        <th className="pb-3 font-medium">Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {monthlySummary.map((month) => (
                                        <tr key={month.month} className="border-b border-slate-800">
                                            <td className="py-3 text-white">{month.displayMonth}</td>
                                            <td className={`py-3 font-medium ${month.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {month.pnl >= 0 ? '+' : ''}₹{month.pnl.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-slate-300">{month.tradeCount}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs ${month.winRate >= 50
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {month.winRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Analytics;
