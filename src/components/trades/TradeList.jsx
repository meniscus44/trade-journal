import { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input, Select } from '../common';
import TradeCard from './TradeCard';
import { ALL_UNDERLYINGS, STRATEGIES, TRADE_STATUS, TRADE_CHANNELS } from '../../utils/constants';

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
];

const resultOptions = [
    { value: '', label: 'All Results' },
    { value: 'profit', label: 'Profitable' },
    { value: 'loss', label: 'Loss' },
];

const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'pnl-desc', label: 'Highest P&L' },
    { value: 'pnl-asc', label: 'Lowest P&L' },
];

const TradeList = ({ trades }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [underlyingFilter, setUnderlyingFilter] = useState('');
    const [resultFilter, setResultFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showFilters, setShowFilters] = useState(false);

    const underlyingOptions = [
        { value: '', label: 'All Underlyings' },
        ...ALL_UNDERLYINGS.map(u => ({ value: u, label: u })),
    ];

    const channelOptions = [
        { value: '', label: 'All Channels' },
        ...TRADE_CHANNELS.map(c => ({ value: c, label: c })),
    ];

    const filteredAndSortedTrades = useMemo(() => {
        let result = [...trades];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(trade =>
                trade.underlying?.toLowerCase().includes(searchLower) ||
                trade.notes?.toLowerCase().includes(searchLower) ||
                trade.rationale?.toLowerCase().includes(searchLower) ||
                trade.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(trade => trade.status === statusFilter);
        }

        // Underlying filter
        if (underlyingFilter) {
            result = result.filter(trade => trade.underlying === underlyingFilter);
        }

        // Channel filter
        if (channelFilter) {
            result = result.filter(trade => trade.channel === channelFilter);
        }

        // Result filter (profit/loss)
        if (resultFilter === 'profit') {
            result = result.filter(trade => trade.netPnL > 0);
        } else if (resultFilter === 'loss') {
            result = result.filter(trade => trade.netPnL < 0);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return (b.entryDate || '').localeCompare(a.entryDate || '');
                case 'date-asc':
                    return (a.entryDate || '').localeCompare(b.entryDate || '');
                case 'pnl-desc':
                    return (b.netPnL || 0) - (a.netPnL || 0);
                case 'pnl-asc':
                    return (a.netPnL || 0) - (b.netPnL || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [trades, search, statusFilter, underlyingFilter, resultFilter, sortBy, channelFilter]);

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder="Search trades..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${showFilters
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                    >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>

                {/* Filters (collapsible) */}
                {showFilters && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-800/50 rounded-lg animate-fade-in">
                        <Select
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={statusOptions}
                            placeholder="All Status"
                        />
                        <Select
                            label="Underlying"
                            value={underlyingFilter}
                            onChange={(e) => setUnderlyingFilter(e.target.value)}
                            options={underlyingOptions}
                            placeholder="All Underlyings"
                        />
                        <Select
                            label="Channel"
                            value={channelFilter}
                            onChange={(e) => setChannelFilter(e.target.value)}
                            options={channelOptions}
                            placeholder="All Channels"
                        />
                        <Select
                            label="Result"
                            value={resultFilter}
                            onChange={(e) => setResultFilter(e.target.value)}
                            options={resultOptions}
                            placeholder="All Results"
                        />
                        <Select
                            label="Sort By"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            options={sortOptions}
                        />
                    </div>
                )}
            </div>

            {/* Results count */}
            <div className="text-sm text-slate-500">
                Showing {filteredAndSortedTrades.length} of {trades.length} trades
            </div>

            {/* Trade list */}
            {filteredAndSortedTrades.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">No trades found</p>
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="mt-2 text-indigo-400 hover:text-indigo-300"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAndSortedTrades.map((trade) => (
                        <TradeCard key={trade.id} trade={trade} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TradeList;
