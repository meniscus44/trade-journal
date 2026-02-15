// Lot sizes for F&O stocks and indices (as of 2025)
export const LOT_SIZES = {
    // Indices
    NIFTY: 65,
    BANKNIFTY: 15,
    FINNIFTY: 25,
    MIDCPNIFTY: 50,
    SENSEX: 20,
    BANKEX: 15,

    // Popular F&O Stocks
    RELIANCE: 250,
    TCS: 150,
    HDFCBANK: 550,
    INFY: 300,
    ICICIBANK: 700,
    HINDUNILVR: 300,
    ITC: 1600,
    SBIN: 750,
    BHARTIARTL: 475,
    KOTAKBANK: 400,
    LT: 150,
    AXISBANK: 600,
    ASIANPAINT: 200,
    MARUTI: 50,
    HCLTECH: 350,
    SUNPHARMA: 350,
    TITAN: 175,
    BAJFINANCE: 125,
    WIPRO: 1000,
    ULTRACEMCO: 100,
    ADANIENT: 250,
    ADANIPORTS: 625,
    TATAMOTORS: 550,
    TATASTEEL: 550,
    POWERGRID: 2700,
    NTPC: 2800,
    ONGC: 1925,
    COALINDIA: 1400,
    JSWSTEEL: 675,
    DIVISLAB: 100,
    DRREDDY: 125,
    CIPLA: 325,
    APOLLOHOSP: 125,
    EICHERMOT: 100,
    BAJAJ_AUTO: 250,
    HEROMOTOCO: 150,
    TECHM: 350,
    NESTLEIND: 25,
    BRITANNIA: 100,
    HINDALCO: 1075,
    GRASIM: 275,
    INDUSINDBK: 450,
    SBILIFE: 375,
    HDFCLIFE: 550,
    BPCL: 1800,
    M_M: 350,
    KPITTECH: 425,
};

// Index underlyings
export const INDEX_OPTIONS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

// All underlyings list
export const ALL_UNDERLYINGS = Object.keys(LOT_SIZES).sort();

// NSE Trading Holidays 2025
export const NSE_HOLIDAYS_2025 = [
    '2025-02-26', // Mahashivratri
    '2025-03-14', // Holi
    '2025-03-31', // Eid-ul-Fitr (tentative)
    '2025-04-10', // Ram Navami
    '2025-04-14', // Dr. Ambedkar Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-06-07', // Eid-ul-Adha (tentative)
    '2025-08-15', // Independence Day
    '2025-08-16', // Parsi New Year
    '2025-08-27', // Ganesh Chaturthi
    '2025-10-02', // Gandhi Jayanti
    '2025-10-21', // Diwali Laxmi Puja
    '2025-10-22', // Diwali Balipratipada
    '2025-11-05', // Guru Nanak Jayanti
    '2025-12-25', // Christmas
];

// NSE Trading Holidays 2026
export const NSE_HOLIDAYS_2026 = [
    '2026-01-26', // Republic Day
    '2026-03-03', // Holi
    '2026-03-26', // Shri Ram Navami
    '2026-03-31', // Shri Mahavir Jayanti
    '2026-04-03', // Good Friday
    '2026-04-14', // Dr. Baba Saheb Ambedkar Jayanti
    '2026-05-01', // Maharashtra Day
    '2026-05-28', // Bakri Id
    '2026-06-26', // Muharram
    '2026-09-14', // Ganesh Chaturthi
    '2026-10-02', // Mahatma Gandhi Jayanti
    '2026-10-20', // Dussehra
    '2026-11-10', // Diwali – Balipratipada
    '2026-11-24', // Prakash Gurpurb Sri Guru Nanak Dev
    '2026-12-25', // Christmas
];

export const ALL_HOLIDAYS = [...NSE_HOLIDAYS_2025, ...NSE_HOLIDAYS_2026];

// Strategy types
export const STRATEGIES = [
    { value: 'NAKED_BUY', label: 'Naked Buy (Long)' },
    { value: 'NAKED_SELL', label: 'Naked Sell (Short)' },
    { value: 'BULL_CALL_SPREAD', label: 'Bull Call Spread' },
    { value: 'BEAR_PUT_SPREAD', label: 'Bear Put Spread' },
    { value: 'BULL_PUT_SPREAD', label: 'Bull Put Spread' },
    { value: 'BEAR_CALL_SPREAD', label: 'Bear Call Spread' },
    { value: 'LONG_STRADDLE', label: 'Long Straddle' },
    { value: 'SHORT_STRADDLE', label: 'Short Straddle' },
    { value: 'LONG_STRANGLE', label: 'Long Strangle' },
    { value: 'SHORT_STRANGLE', label: 'Short Strangle' },
    { value: 'IRON_CONDOR', label: 'Iron Condor' },
    { value: 'IRON_BUTTERFLY', label: 'Iron Butterfly' },
    { value: 'CALENDAR_SPREAD', label: 'Calendar Spread' },
    { value: 'RATIO_SPREAD', label: 'Ratio Spread' },
    { value: 'COVERED_CALL', label: 'Covered Call' },
    { value: 'PROTECTIVE_PUT', label: 'Protective Put' },
    { value: 'OTHER', label: 'Other' },
];

// Emotion/mindset options
export const EMOTIONS = [
    { value: 'calm', label: '😌 Calm', color: 'text-green-500' },
    { value: 'confident', label: '💪 Confident', color: 'text-blue-500' },
    { value: 'anxious', label: '😰 Anxious', color: 'text-yellow-500' },
    { value: 'fomo', label: '😱 FOMO', color: 'text-orange-500' },
    { value: 'greedy', label: '🤑 Greedy', color: 'text-red-500' },
    { value: 'fearful', label: '😨 Fearful', color: 'text-purple-500' },
    { value: 'revenge', label: '😤 Revenge Trading', color: 'text-red-600' },
    { value: 'patient', label: '🧘 Patient', color: 'text-teal-500' },
    { value: 'neutral', label: '😐 Neutral', color: 'text-gray-500' },
];

// Trade Channels
export const TRADE_CHANNELS = [
    'Trade with Walia',
    'TradeVix',
    'Zero Hero Trade',
    'TradeX Trading',
    'Vijay Master Trader',
    'Self Analysis',
    'Other'
];

// Trade status
export const TRADE_STATUS = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
    EXPIRED: 'EXPIRED',
};

// Direction types
export const DIRECTIONS = {
    BUY: 'BUY',
    SELL: 'SELL',
};

// Option types
export const OPTION_TYPES = {
    CE: 'CE',
    PE: 'PE',
};

// Default charge rates (Groww)
// Default charge rates (Groww)
export const DEFAULT_CHARGE_RATES = {
    brokerage: 20, // ₹20 per order
    sttRate: 0.001, // 0.1% on sell side (revised Oct 2024)
    exchangeRate: 0.00035, // 0.035% NSE Options Premium
    gstRate: 0.18, // 18% GST
    sebiRate: 0.000001, // ₹10 per crore
    ipftRate: 0.000005, // ₹50 per crore (approx 0.0005%)
    stampDutyRate: 0.00003, // 0.003% on buy side
};

// Important events calendar
export const IMPORTANT_EVENTS_2025 = [
    { date: '2025-02-01', event: 'Union Budget 2025', type: 'budget' },
    { date: '2025-02-07', event: 'RBI MPC Decision', type: 'rbi' },
    { date: '2025-04-09', event: 'RBI MPC Decision', type: 'rbi' },
    { date: '2025-06-06', event: 'RBI MPC Decision', type: 'rbi' },
    { date: '2025-08-08', event: 'RBI MPC Decision', type: 'rbi' },
    { date: '2025-10-10', event: 'RBI MPC Decision', type: 'rbi' },
    { date: '2025-12-05', event: 'RBI MPC Decision', type: 'rbi' },
];

// Get lot size for an underlying
export const getLotSize = (underlying) => {
    return LOT_SIZES[underlying?.toUpperCase()] || 1;
};

// Check if a date is a trading holiday
export const isHoliday = (dateStr) => {
    return ALL_HOLIDAYS.includes(dateStr);
};

// Get strategy label
export const getStrategyLabel = (value) => {
    const strategy = STRATEGIES.find(s => s.value === value);
    return strategy?.label || value;
};

// Get emotion data
export const getEmotionData = (value) => {
    return EMOTIONS.find(e => e.value === value) || { value, label: value, color: 'text-gray-500' };
};
