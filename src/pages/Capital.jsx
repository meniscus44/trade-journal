import React, { useState, useEffect } from 'react';
import {
    Plus,
    TrendingUp,
    Calendar as CalendarIcon,
    Trash2,
    Edit2,
    Save,
    X,
    IndianRupee
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, parseISO, startOfDay, isAfter } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useTrades } from '../context/TradesContext';
import { formatCurrency } from '../utils/charges';

const Capital = () => {
    const { capitalEntries, addCapitalEntry, deleteCapitalEntry } = useTrades();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date || !amount) return;

        try {
            await addCapitalEntry({
                date,
                openingBalance: parseFloat(amount),
                notes
            });
            resetForm();
        } catch (error) {
            alert('Failed to save capital entry');
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setDate(entry.date);
        setAmount(entry.openingBalance.toString());
        setNotes(entry.notes || '');
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            await deleteCapitalEntry(id);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setAmount('');
        setNotes('');
    };

    // Prepare chart data (reverse to show chronological order left-to-right)
    const chartData = [...capitalEntries].reverse().map(e => ({
        date: format(parseISO(e.date), 'MMM d'),
        amount: e.openingBalance,
        fullDate: e.date
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Capital Tracking</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your daily opening balance for accurate ROI calculations</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} icon={Plus}>
                        Add Entry
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Capital</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {capitalEntries.length > 0 ? formatCurrency(capitalEntries[0].openingBalance) : '₹0.00'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {capitalEntries.length > 0 ? `As of ${format(parseISO(capitalEntries[0].date), 'MMM d, yyyy')}` : 'No data'}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                            <IndianRupee size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Capital Growth Chart */}
            {capitalEntries.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Capital Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}
                                    formatter={(value) => [formatCurrency(value), 'Capital']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#6366f1' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                {isAdding && (
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>{editingId ? 'Edit Entry' : 'New Capital Entry'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Opening Balance (₹)"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="e.g. 100000"
                                        required
                                        step="0.01"
                                    />
                                    <Input
                                        label="Notes (Optional)"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. Added funds, Withdrawal..."
                                    />
                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" icon={Save} fullWidth>
                                            Save Entry
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={resetForm} icon={X}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* List Section */}
                <div className={isAdding ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {capitalEntries.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <p>No capital entries yet.</p>
                                    <p className="text-sm">Record your daily opening balance to track growth.</p>
                                    <Button variant="secondary" className="mt-4" onClick={() => setIsAdding(true)}>
                                        Add First Entry
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Date</th>
                                                <th className="px-4 py-3 text-right">Opening Balance</th>
                                                <th className="px-4 py-3 text-left">Notes</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {capitalEntries.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                    <td className="px-4 py-3 font-medium">
                                                        {format(parseISO(entry.date), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                                        {formatCurrency(entry.openingBalance)}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 truncate max-w-[200px]">
                                                        {entry.notes || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(entry)}
                                                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Capital;
