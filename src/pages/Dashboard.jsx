import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { Button, Card, CardTitle } from '../components/common';
import { MetricsGrid, PnLChart, TradingCalendar, BreakdownChart } from '../components/analytics';
import { TradeCard } from '../components/trades';
import { useTrades } from '../context/TradesContext';
import { format } from 'date-fns';

import { calculateStats, getPnLByDate, groupByField } from '../utils/calculations';
import { formatCurrency } from '../utils/charges';
import { subDays } from 'date-fns';

const Dashboard = () => {
    const { trades, capitalEntries, loading } = useTrades();

    const stats = useMemo(() => calculateStats(trades), [trades]);
    const BASE_CAPITAL = 25000;

    const capitalStats = useMemo(() => {
        if (capitalEntries.length === 0) return { initial: BASE_CAPITAL, current: 0, lastUpdated: 'Never' };

        // Sort ascending for dates
        const sorted = [...capitalEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
            initial: BASE_CAPITAL, // Fixed base capital as requested
            current: sorted[sorted.length - 1].openingBalance,
            lastUpdated: format(new Date(sorted[sorted.length - 1].date), 'MMM d, yyyy')
        };
    }, [capitalEntries]);

    const pnlData = useMemo(() => {
        const endDate = new Date();
        const startDate = subDays(endDate, 30);
        return getPnLByDate(trades, startDate, endDate);
    }, [trades]);

    const recentTrades = useMemo(() => {
        return [...trades]
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .slice(0, 5);
    }, [trades]);

    const byUnderlying = useMemo(() =>
        groupByField(trades.filter(t => t.status === 'CLOSED'), 'underlying'),
        [trades]
    );

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
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Your trading performance at a glance</p>
                </div>
                <Link to="/new-trade">
                    <Button icon={PlusCircle}>
                        Add Trade
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            {trades.length > 0 ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-600/20 dark:to-purple-600/20 border-indigo-100 dark:border-indigo-500/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Total P&L</p>
                                    <p className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(stats.totalPnL)}
                                    </p>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {stats.totalTrades} closed trades
                                    </p>
                                </div>
                                {stats.totalPnL >= 0 ? (
                                    <TrendingUp className="h-12 w-12 text-emerald-600/20 dark:text-emerald-400/30" />
                                ) : (
                                    <TrendingDown className="h-12 w-12 text-red-600/20 dark:text-red-400/30" />
                                )}
                            </div>
                        </Card>

                        {/* ROI Card */}
                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">Total ROI</p>
                                    <p className={`text-3xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {((stats.totalPnL / capitalStats.initial) * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-slate-500 text-sm mt-1">
                                        on {formatCurrency(capitalStats.initial)} base
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </Card>

                        {/* Capital Card */}
                        {capitalStats.current > 0 && (
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Current Capital</p>
                                        <p className="text-3xl font-bold text-white">
                                            {formatCurrency(capitalStats.current)}
                                        </p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Updated {capitalStats.lastUpdated}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-violet-500/20 rounded-full text-violet-400">
                                        <ArrowRight size={24} className="rotate-[-45deg]" />
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">Win Rate</p>
                                    <p className="text-3xl font-bold text-white">{stats.winRate}%</p>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {stats.winningTrades}W / {stats.losingTrades}L
                                    </p>
                                </div>
                                <div className="relative w-16 h-16">
                                    <svg className="transform -rotate-90 w-16 h-16">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="#334155"
                                            strokeWidth="6"
                                            fill="none"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke={stats.winRate >= 50 ? '#10b981' : '#f59e0b'}
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray={`${(stats.winRate / 100) * 176} 176`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* P&L Chart */}
                    <PnLChart data={pnlData} title="Last 30 Days P&L" />

                    {/* Insights Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Strategy Performance */}
                        <BreakdownChart
                            data={byUnderlying}
                            title="P&L by Underlying"
                        />

                        {/* Recent Trades */}
                        <div className="h-full">
                            <div className="flex items-center justify-between mb-4">
                                <CardTitle>Recent Trades</CardTitle>
                                <Link to="/trades" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm">
                                    View all <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {recentTrades.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTrades.map((trade) => (
                                        <TradeCard key={trade.id} trade={trade} />
                                    ))}
                                </div>
                            ) : (
                                <Card className="text-center py-8">
                                    <p className="text-slate-500">No trades yet</p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Trading Calendar */}
                    <TradingCalendar trades={trades} />
                </>
            ) : (
                /* Empty state */
                <Card className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-600/20 flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Welcome to Options Journal
                        </h2>
                        <p className="text-slate-400 mb-6">
                            Start tracking your F&O trades to get insights into your trading performance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/new-trade">
                                <Button icon={PlusCircle}>Add Your First Trade</Button>
                            </Link>

                        </div>
                    </div>
                </Card>
            )
            }
        </div >
    );
};

export default Dashboard;
