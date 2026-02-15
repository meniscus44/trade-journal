const STORAGE_KEY = 'options_journal_trades';
const SETTINGS_KEY = 'options_journal_settings';
const CAPITAL_KEY = 'options_journal_capital';

/**
 * Get all capital entries
 */
export const getAllCapitalEntries = () => {
    try {
        const data = localStorage.getItem(CAPITAL_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading capital from storage:', error);
        return [];
    }
};

/**
 * Save capital entries
 */
export const saveCapitalEntries = (entries) => {
    try {
        localStorage.setItem(CAPITAL_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving capital to storage:', error);
        throw error;
    }
};

/**
 * Add or Update capital entry for a date
 */
export const saveCapitalEntry = (entry) => {
    const entries = getAllCapitalEntries();
    const index = entries.findIndex(e => e.date === entry.date);

    if (index >= 0) {
        entries[index] = { ...entries[index], ...entry, updatedAt: new Date().toISOString() };
    } else {
        entries.push({
            id: crypto.randomUUID(),
            ...entry,
            updatedAt: new Date().toISOString()
        });
    }

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveCapitalEntries(entries);
    return entries;
};

/**
 * Get capital for a specific date
 * Returns the entry for that date, or the most recent previous entry
 */
export const getCapitalForDate = (dateStr) => {
    const entries = getAllCapitalEntries();
    // precise match
    const exact = entries.find(e => e.date === dateStr);
    if (exact) return exact.openingBalance;

    // fallback to most recent before this date
    const targetDate = new Date(dateStr);
    const valid = entries.filter(e => new Date(e.date) <= targetDate);
    if (valid.length > 0) {
        // defined sort is desc
        return valid[0].openingBalance;
    }

    return null; // No capital history found
};

/**
 * Delete capital entry
 */
export const deleteCapitalEntry = (id) => {
    const entries = getAllCapitalEntries();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length !== entries.length) {
        saveCapitalEntries(filtered);
        return true;
    }
    return false;
};

/**
 * Get all trades from localStorage
 * @returns {Array} - Array of trade objects
 */
export const getAllTrades = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading trades from storage:', error);
        return [];
    }
};

/**
 * Save all trades to localStorage
 * @param {Array} trades - Array of trade objects
 */
export const saveAllTrades = (trades) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (error) {
        console.error('Error saving trades to storage:', error);
        throw error;
    }
};

/**
 * Add a new trade
 * @param {Object} trade - Trade object to add
 * @returns {Object} - The added trade with ID
 */
export const addTrade = (trade) => {
    const trades = getAllTrades();
    const newTrade = {
        ...trade,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    trades.unshift(newTrade); // Add to beginning
    saveAllTrades(trades);
    return newTrade;
};

/**
 * Update an existing trade
 * @param {string} id - Trade ID
 * @param {Object} updates - Partial trade object with updates
 * @returns {Object|null} - Updated trade or null if not found
 */
export const updateTrade = (id, updates) => {
    const trades = getAllTrades();
    const index = trades.findIndex((t) => t.id === id);

    if (index === -1) return null;

    trades[index] = {
        ...trades[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    saveAllTrades(trades);
    return trades[index];
};

/**
 * Delete a trade
 * @param {string} id - Trade ID
 * @returns {boolean} - True if deleted, false if not found
 */
export const deleteTrade = (id) => {
    const trades = getAllTrades();
    const filtered = trades.filter((t) => t.id !== id);

    if (filtered.length === trades.length) return false;

    saveAllTrades(filtered);
    return true;
};

/**
 * Get a single trade by ID
 * @param {string} id - Trade ID
 * @returns {Object|null} - Trade object or null
 */
export const getTradeById = (id) => {
    const trades = getAllTrades();
    return trades.find((t) => t.id === id) || null;
};

/**
 * Import trades (merge with existing)
 * @param {Array} newTrades - Array of trades to import
 * @param {boolean} skipDuplicates - Whether to skip duplicate trades
 * @returns {Object} - Import results
 */
export const importTrades = (newTrades, skipDuplicates = true) => {
    const existingTrades = getAllTrades();
    let imported = 0;
    let skipped = 0;

    const tradesWithIds = newTrades.map((trade) => {
        // Check for duplicates based on key fields
        if (skipDuplicates) {
            const isDuplicate = existingTrades.some(
                (existing) =>
                    existing.underlying === trade.underlying &&
                    existing.strikePrice === trade.strikePrice &&
                    existing.expiryDate === trade.expiryDate &&
                    existing.entryDate === trade.entryDate &&
                    existing.entryPrice === trade.entryPrice
            );

            if (isDuplicate) {
                skipped++;
                return null;
            }
        }

        imported++;
        return {
            ...trade,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }).filter(Boolean);

    const allTrades = [...tradesWithIds, ...existingTrades];
    saveAllTrades(allTrades);

    return { imported, skipped, total: allTrades.length };
};

/**
 * Export trades as JSON string
 * @returns {string} - JSON string of all trades
 */
export const exportTradesJSON = () => {
    const trades = getAllTrades();
    return JSON.stringify(trades, null, 2);
};

/**
 * Export trades as CSV string
 * @returns {string} - CSV string of all trades
 */
export const exportTradesCSV = () => {
    const trades = getAllTrades();
    if (trades.length === 0) return '';

    const headers = [
        'ID', 'Underlying', 'Exchange', 'Option Type', 'Strike Price', 'Expiry Date',
        'Lot Size', 'Quantity', 'Direction', 'Strategy',
        'Entry Date', 'Entry Time', 'Entry Price', 'Spot at Entry',
        'Exit Date', 'Exit Time', 'Exit Price', 'Spot at Exit',
        'Status', 'Gross P&L', 'Total Charges', 'Net P&L',
        'Rationale', 'Emotions', 'Lessons Learned', 'Rating', 'Notes', 'Tags'
    ];

    const rows = trades.map((trade) => [
        trade.id,
        trade.underlying,
        trade.exchange,
        trade.optionType,
        trade.strikePrice,
        trade.expiryDate,
        trade.lotSize,
        trade.quantity,
        trade.direction,
        trade.strategy,
        trade.entryDate,
        trade.entryTime,
        trade.entryPrice,
        trade.spotAtEntry,
        trade.exitDate || '',
        trade.exitTime || '',
        trade.exitPrice || '',
        trade.spotAtExit || '',
        trade.status,
        trade.grossPnL || '',
        trade.charges?.total || '',
        trade.netPnL || '',
        `"${(trade.rationale || '').replace(/"/g, '""')}"`,
        trade.emotions,
        `"${(trade.lessonsLearned || '').replace(/"/g, '""')}"`,
        trade.rating,
        `"${(trade.notes || '').replace(/"/g, '""')}"`,
        (trade.tags || []).join(';'),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * Clear all trades (with confirmation)
 */
export const clearAllTrades = () => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get app settings
 * @returns {Object} - Settings object
 */
export const getSettings = () => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : getDefaultSettings();
    } catch (error) {
        console.error('Error reading settings:', error);
        return getDefaultSettings();
    }
};

/**
 * Save app settings
 * @param {Object} settings - Settings object
 */
export const saveSettings = (settings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
};

/**
 * Get default settings
 * @returns {Object} - Default settings
 */
export const getDefaultSettings = () => ({
    theme: 'dark',
    broker: 'groww',
    brokerage: 20,
    defaultExchange: 'NSE',
});

/**
 * Create a backup of all data
 * @returns {Object} - Backup object with trades and settings
 */
export const createBackup = () => {
    return {
        version: '1.1',
        exportedAt: new Date().toISOString(),
        trades: getAllTrades(),
        settings: getSettings(),
        capital: getAllCapitalEntries(),
    };
};

/**
 * Restore from backup
 * @param {Object} backup - Backup object
 */
export const restoreFromBackup = (backup) => {
    if (backup.trades) {
        saveAllTrades(backup.trades);
    }
    if (backup.settings) {
        saveSettings(backup.settings);
    }
    if (backup.capital) {
        saveCapitalEntries(backup.capital);
    }
};
