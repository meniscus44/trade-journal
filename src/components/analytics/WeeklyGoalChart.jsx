import React, { useMemo } from 'react';
import { startOfWeek, endOfWeek, isWithinInterval, subWeeks, format } from 'date-fns';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from 'recharts';
import { Card, CardTitle } from '../common';
import { formatCurrency } from '../../utils/charges';
import { useTheme } from '../../context/ThemeContext';

const WeeklyGoalChart = ({ trades }) => {
    const { isDark } = useTheme();
    const BASE_CAPITAL = 25000;
    const WEEKLY_TARGET = BASE_CAPITAL * 0.05;

    const weeklyData = useMemo(() => {
        const weeks = [];
        const today = new Date();
        // Show last 10 weeks
        for (let i = 9; i >= 0; i--) {
            const start = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
            const end = endOfWeek(start, { weekStartsOn: 1 });
            const label = `${format(start, 'd MMM')}`;
            const fullLabel = `${format(start, 'd MMM')} - ${format(end, 'd MMM')}`;

            const weeklyTrades = trades.filter(t => {
                if (!t.exitDate) return false;
                const exitDate = new Date(t.exitDate);
                return isWithinInterval(exitDate, { start, end });
            });

            const pnl = weeklyTrades.reduce((sum, t) => sum + (t.netPnL || 0), 0);
            weeks.push({
                name: label,
                fullLabel,
                pnl,
                target: WEEKLY_TARGET,
                isTargetMet: pnl >= WEEKLY_TARGET
            });
        }
        return weeks;
    }, [trades]);

    const currentWeek = weeklyData[weeklyData.length - 1];
    const progress = Math.min((currentWeek.pnl / WEEKLY_TARGET) * 100, 100);
    const isProfit = currentWeek.pnl >= 0;
    const isGoalReached = currentWeek.pnl >= WEEKLY_TARGET;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className={`p-3 rounded-lg shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.fullLabel}</p>
                    <p className={`font-bold ${data.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(data.pnl)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Target: {((data.pnl / WEEKLY_TARGET) * 100).toFixed(0)}% reached
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Current Week Card */}
            <Card className="lg:col-span-1">
                <CardTitle>Current Week</CardTitle>
                <div className="flex flex-col h-full justify-center mt-2">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Net P&L</p>
                            <p className={`text-3xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(currentWeek.pnl)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500">Target</p>
                            <p className="text-lg font-medium text-slate-300">{formatCurrency(WEEKLY_TARGET)}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${isGoalReached ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.max(0, progress)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{isGoalReached ? 'Goal Reached! 🎉' : `${(progress).toFixed(0)}% to target`}</span>
                        <span className="text-emerald-400/80">{isGoalReached ? `+${formatCurrency(currentWeek.pnl - WEEKLY_TARGET)} over` : ''}</span>
                    </div>
                </div>
            </Card>

            {/* History Chart */}
            <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle>Weekly Goal History</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Profit</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Loss</span>
                        <span className="flex items-center gap-1 border-l border-slate-700 pl-2"><div className="w-4 h-0.5 bg-amber-500 border-dashed"></div> Target (5%)</span>
                    </div>
                </div>

                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                                tickLine={false}
                                axisLine={{ stroke: isDark ? '#475569' : '#cbd5e1' }}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                                tickLine={false}
                                axisLine={{ stroke: isDark ? '#475569' : '#cbd5e1' }}
                                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.3 }} />
                            <ReferenceLine y={WEEKLY_TARGET} stroke="#f59e0b" strokeDasharray="3 3" />
                            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {weeklyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default WeeklyGoalChart;
