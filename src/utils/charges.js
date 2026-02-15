import { DEFAULT_CHARGE_RATES } from './constants';

/**
 * Calculate all charges for an options trade (Indian market)
 * @param {Object} params - Trade parameters
 * @param {number} params.entryPrice - Entry premium per share
 * @param {number} params.exitPrice - Exit premium per share (null if open)
 * @param {number} params.lotSize - Lot size of the underlying
 * @param {number} params.quantity - Number of lots
 * @param {string} params.direction - BUY or SELL
 * @param {Object} params.rates - Custom charge rates (optional)
 * @returns {Object} - Breakdown of all charges
 */
export const calculateCharges = ({
    entryPrice,
    exitPrice,
    lotSize,
    quantity,
    direction,
    rates = DEFAULT_CHARGE_RATES,
}) => {
    const totalShares = lotSize * quantity;
    const entryTurnover = entryPrice * totalShares;
    const exitTurnover = exitPrice ? exitPrice * totalShares : 0;
    const totalTurnover = entryTurnover + exitTurnover;

    // Brokerage: ₹20 per order (entry + exit = 2 orders if closed)
    const numOrders = exitPrice ? 2 : 1;
    const brokerage = rates.brokerage * numOrders;

    // STT: 0.0625% on sell side premium (options)
    // For BUY trades, STT is on exit. For SELL trades, STT is on entry.
    let stt = 0;
    if (direction === 'BUY' && exitPrice) {
        stt = exitTurnover * rates.sttRate;
    } else if (direction === 'SELL') {
        stt = entryTurnover * rates.sttRate;
    }

    // Exchange transaction charges: 0.0495% on total turnover
    const exchangeCharges = totalTurnover * rates.exchangeRate;

    // GST: 18% on (brokerage + exchange charges)
    const gst = (brokerage + exchangeCharges) * rates.gstRate;

    // SEBI turnover fee: ₹10 per crore
    const sebiCharges = totalTurnover * rates.sebiRate;

    // Stamp duty: 0.003% on buy side only
    let stampDuty = 0;
    if (direction === 'BUY') {
        stampDuty = entryTurnover * rates.stampDutyRate;
    }

    // IPFT Charges: ₹50 per crore
    const ipftCharges = totalTurnover * (rates.ipftRate || 0);

    // Total charges
    const total = brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty + ipftCharges;

    return {
        brokerage: Math.round(brokerage * 100) / 100,
        stt: Math.round(stt * 100) / 100,
        exchangeCharges: Math.round(exchangeCharges * 100) / 100,
        gst: Math.round(gst * 100) / 100,
        sebiCharges: Math.round(sebiCharges * 100) / 100,
        stampDuty: Math.round(stampDuty * 100) / 100,
        ipftCharges: Math.round(ipftCharges * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
};

/**
 * Calculate P&L for a trade
 * @param {Object} trade - Trade object
 * @returns {Object} - P&L breakdown
 */
export const calculatePnL = (trade) => {
    const { entryPrice, exitPrice, lotSize, quantity, direction, charges } = trade;
    const totalShares = lotSize * quantity;

    if (!exitPrice) {
        return {
            grossPnL: 0,
            netPnL: 0,
            percentageReturn: 0,
        };
    }

    let grossPnL;
    if (direction === 'BUY') {
        // Long: Profit if exit > entry
        grossPnL = (exitPrice - entryPrice) * totalShares;
    } else {
        // Short: Profit if entry > exit
        grossPnL = (entryPrice - exitPrice) * totalShares;
    }

    const totalCharges = charges?.total || 0;
    const netPnL = grossPnL - totalCharges;

    // Calculate percentage return based on entry investment
    const entryInvestment = entryPrice * totalShares;
    const percentageReturn = entryInvestment > 0 ? (grossPnL / entryInvestment) * 100 : 0;

    return {
        grossPnL: Math.round(grossPnL * 100) / 100,
        netPnL: Math.round(netPnL * 100) / 100,
        percentageReturn: Math.round(percentageReturn * 100) / 100,
        capitalUsed: entryInvestment,
    };
};

/**
 * Format currency in INR
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';

    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    return sign + '₹' + absAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
};
