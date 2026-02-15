import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { Card, CardTitle } from '../common';
import { formatCurrency } from '../../utils/charges';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
                <p className="text-white font-medium mb-1">{data.name}</p>
                <p className={`font-semibold ${data.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    P&L: {formatCurrency(data.pnl)}
                </p>
                <p className="text-slate-400 text-sm">Trades: {data.count}</p>
                <p className="text-slate-400 text-sm">Win Rate: {data.winRate}%</p>
            </div>
        );
    }
    return null;
};

export const BreakdownBarChart = ({ data, title, dataKey = 'pnl' }) => {
    const { isDark } = useTheme();

    const colors = {
        grid: isDark ? '#334155' : '#e2e8f0',
        text: isDark ? '#94a3b8' : '#64748b',
        axis: isDark ? '#475569' : '#cbd5e1',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#f8fafc' : '#0f172a',
        tooltipLabel: isDark ? '#94a3b8' : '#64748b',
    };

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

    return (
        <Card className="h-full flex flex-col">
            <CardTitle className="mb-4">{title}</CardTitle>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={true} vertical={false} />
                        <XAxis
                            type="number"
                            tick={{ fill: colors.text, fontSize: 12 }}
                            tickLine={{ stroke: colors.axis }}
                            axisLine={{ stroke: colors.axis }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: colors.text, fontSize: 11 }}
                            tickLine={{ stroke: colors.axis }}
                            axisLine={{ stroke: colors.axis }}
                            width={80}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: colors.tooltipBg,
                                borderColor: colors.tooltipBorder,
                                color: colors.tooltipText
                            }}
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            content={<CustomTooltip />}
                        />
                        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry[dataKey] >= 0 ? (isDark ? '#10b981' : '#059669') : (isDark ? '#ef4444' : '#dc2626')}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export const BreakdownPieChart = ({ data, title }) => {
    const { isDark } = useTheme();

    const colors = {
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipBorder: isDark ? '#334155' : '#e2e8f0',
        tooltipText: isDark ? '#f8fafc' : '#0f172a',
        tooltipLabel: isDark ? '#94a3b8' : '#64748b',
    };

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

    // Use absolute values for pie chart
    const pieData = data.map(d => ({
        ...d,
        value: Math.abs(d.count),
    }));

    return (
        <Card>
            <CardTitle className="mb-4">{title}</CardTitle>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => [`${value} trades`, props.payload.name]}
                            contentStyle={{
                                backgroundColor: colors.tooltipBg,
                                borderColor: colors.tooltipBorder,
                                color: colors.tooltipText
                            }}
                            itemStyle={{ color: colors.tooltipText }}
                            labelStyle={{ color: colors.tooltipLabel }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value) => <span className="text-slate-600 dark:text-slate-400">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const BreakdownChart = ({ data, title, type = 'bar' }) => {
    if (type === 'pie') {
        return <BreakdownPieChart data={data} title={title} />;
    }
    return <BreakdownBarChart data={data} title={title} />;
};

export default BreakdownChart;
