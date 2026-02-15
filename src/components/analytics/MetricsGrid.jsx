import { TrendingUp, TrendingDown, Target, Percent, DollarSign, Award, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card } from '../common';
import { formatCurrency } from '../../utils/charges';

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'default' }) => {
    const colors = {
        default: 'text-white',
        success: 'text-emerald-400',
        danger: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-indigo-400',
    };

    const bgColors = {
        default: 'bg-slate-700/50',
        success: 'bg-emerald-500/10',
        danger: 'bg-red-500/10',
        warning: 'bg-yellow-500/10',
        info: 'bg-indigo-500/10',
    };

    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${colors[color]}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2 rounded-lg ${bgColors[color]}`}>
                        <Icon className={`h-5 w-5 ${colors[color]}`} />
                    </div>
                )}
            </div>
            {trend !== undefined && (
                <div className={`mt-2 flex items-center gap-1 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{Math.abs(trend).toFixed(1)}% vs last period</span>
                </div>
            )}
        </Card>
    );
};

const MetricsGrid = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
                title="Total P&L"
                value={formatCurrency(stats.totalPnL)}
                subtitle={`${stats.totalTrades} trades`}
                icon={stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
                color={stats.totalPnL >= 0 ? 'success' : 'danger'}
            />

            <MetricCard
                title="Win Rate"
                value={`${stats.winRate}%`}
                subtitle={`${stats.winningTrades}W / ${stats.losingTrades}L`}
                icon={Target}
                color={stats.winRate >= 50 ? 'success' : 'warning'}
            />

            <MetricCard
                title="Profit Factor"
                value={stats.profitFactor}
                subtitle="Gross profit / Gross loss"
                icon={BarChart3}
                color={stats.profitFactor >= 1.5 ? 'success' : stats.profitFactor >= 1 ? 'warning' : 'danger'}
            />

            <MetricCard
                title="Expectancy"
                value={formatCurrency(stats.expectancy)}
                subtitle="Avg return per trade"
                icon={Award}
                color={stats.expectancy >= 0 ? 'success' : 'danger'}
            />

            <MetricCard
                title="Average Win"
                value={formatCurrency(stats.avgWin)}
                icon={TrendingUp}
                color="success"
            />

            <MetricCard
                title="Average Loss"
                value={formatCurrency(stats.avgLoss)}
                icon={TrendingDown}
                color="danger"
            />

            <MetricCard
                title="Largest Win"
                value={formatCurrency(stats.largestWin)}
                icon={Award}
                color="success"
            />

            <MetricCard
                title="Largest Loss"
                value={formatCurrency(Math.abs(stats.largestLoss))}
                icon={AlertTriangle}
                color="danger"
            />

            <MetricCard
                title="Total Charges"
                value={formatCurrency(stats.totalCharges)}
                subtitle="Brokerage + taxes"
                icon={DollarSign}
                color="warning"
            />

            <MetricCard
                title="Gross Profit"
                value={formatCurrency(stats.grossProfit)}
                icon={TrendingUp}
                color="success"
            />

            <MetricCard
                title="Gross Loss"
                value={formatCurrency(stats.grossLoss)}
                icon={TrendingDown}
                color="danger"
            />

            <MetricCard
                title="Avg Trade"
                value={formatCurrency(stats.avgTradeReturn)}
                icon={BarChart3}
                color={stats.avgTradeReturn >= 0 ? 'success' : 'danger'}
            />

            <MetricCard
                title="Avg Trade %"
                value={`${stats.avgProfitPercentPerTrade}%`}
                icon={Percent}
                color={stats.avgProfitPercentPerTrade >= 0 ? 'success' : 'danger'}
            />

            <MetricCard
                title="Avg Capital"
                value={formatCurrency(stats.avgCapitalPerTrade)}
                icon={DollarSign}
                color="info"
            />

            <MetricCard
                title="Avg Daily Return"
                value={`${stats.avgDailyReturn}%`}
                subtitle="On traded capital"
                icon={TrendingUp}
                color={stats.avgDailyReturn >= 0 ? 'success' : 'danger'}
            />

            <MetricCard
                title="Max Drawdown"
                value={formatCurrency(Math.abs(stats.maxDrawdown))}
                subtitle={`${stats.maxDrawdownPercent}% from peak`}
                icon={TrendingDown}
                color="danger"
            />
        </div>
    );
};

export default MetricsGrid;
