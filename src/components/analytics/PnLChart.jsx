import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Card, CardTitle } from '../common';
import { formatCurrency } from '../../utils/charges';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
                <p className="text-slate-400 text-sm mb-1">{label}</p>
                <p className={`font-semibold ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const PnLChart = ({ data, title = "Cumulative P&L" }) => {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardTitle>{title}</CardTitle>
                <div className="h-64 flex items-center justify-center text-slate-500">
                    No data to display
                </div>
            </Card>
        );
    }

    const { isDark } = useTheme();
    const lastValue = data[data.length - 1]?.cumulativePnL || 0;
    const isPositive = lastValue >= 0;

    const colors = {
        grid: isDark ? '#334155' : '#e2e8f0',
        text: isDark ? '#94a3b8' : '#64748b',
        axis: isDark ? '#475569' : '#cbd5e1',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#f8fafc' : '#0f172a',
        tooltipLabel: isDark ? '#94a3b8' : '#64748b',
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <CardTitle>{title}</CardTitle>
                <span className={`text-lg font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(lastValue)}
                </span>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.axis }}
                            axisLine={{ stroke: colors.axis }}
                            minTickGap={30}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.axis }}
                            axisLine={{ stroke: colors.axis }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: colors.tooltipBg,
                                borderColor: colors.tooltipBorder,
                                color: colors.tooltipText
                            }}
                            itemStyle={{ color: colors.tooltipText }}
                            labelStyle={{ color: colors.tooltipLabel }}
                            content={<CustomTooltip />}
                        /> {/* CustomTooltip might override style props, need to check if CustomTooltip uses theme */}
                        <ReferenceLine y={0} stroke={colors.axis} strokeDasharray="3 3" />
                        <Line
                            type="monotone"
                            dataKey="cumulativePnL"
                            stroke={isPositive ? (isDark ? '#10b981' : '#059669') : (isDark ? '#ef4444' : '#dc2626')}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: isPositive ? (isDark ? '#10b981' : '#059669') : (isDark ? '#ef4444' : '#dc2626') }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default PnLChart;
