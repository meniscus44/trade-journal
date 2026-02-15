import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Calculator } from 'lucide-react';
import { Button, Input, Select, Card } from '../common';
import {
    ALL_UNDERLYINGS,
    INDEX_OPTIONS,
    STRATEGIES,
    EMOTIONS,
    getLotSize,
    OPTION_TYPES,
    DIRECTIONS,
    TRADE_CHANNELS
} from '../../utils/constants';
import { useTrades } from '../../context/TradesContext';
import { calculateCharges, formatCurrency } from '../../utils/charges';

const underlyingOptions = ALL_UNDERLYINGS.map(u => ({
    value: u,
    label: INDEX_OPTIONS.includes(u) ? `${u} (Index)` : u
}));

const optionTypeOptions = [
    { value: 'CE', label: 'CE (Call)' },
    { value: 'PE', label: 'PE (Put)' },
];

const directionOptions = [
    { value: 'BUY', label: 'Buy (Long)' },
    { value: 'SELL', label: 'Sell (Short)' },
];

const TradeForm = ({ trade, onSuccess }) => {
    const navigate = useNavigate();
    const { addTrade, updateTrade } = useTrades();
    const isEditing = !!trade;

    const [formData, setFormData] = useState({
        underlying: '',
        exchange: 'NSE',
        optionType: 'CE',
        strikePrice: '',
        expiryDate: '',
        quantity: 1,
        direction: 'BUY',
        entryDate: new Date().toISOString().split('T')[0],
        entryTime: '',
        entryPrice: '',
        spotAtEntry: '',
        exitDate: '',
        exitTime: '',
        exitPrice: '',
        spotAtExit: '',
        strategy: 'NAKED_BUY',
        tags: [],
        rationale: '',
        emotions: 'neutral',
        lessonsLearned: '',
        rating: null,
        notes: '',
        channel: '',
    });

    const [errors, setErrors] = useState({});
    const [chargePreview, setChargePreview] = useState(null);
    const [saving, setSaving] = useState(false);

    // Load existing trade data if editing
    useEffect(() => {
        if (trade) {
            setFormData({
                ...trade,
                tags: trade.tags || [],
            });
        }
    }, [trade]);

    // Get lot size for selected underlying
    const lotSize = formData.underlying ? getLotSize(formData.underlying) : 0;

    // Calculate charges preview
    useEffect(() => {
        if (formData.entryPrice && formData.exitPrice && formData.underlying) {
            const charges = calculateCharges({
                entryPrice: parseFloat(formData.entryPrice),
                exitPrice: parseFloat(formData.exitPrice),
                lotSize,
                quantity: parseInt(formData.quantity),
                direction: formData.direction,
            });
            setChargePreview(charges);
        } else {
            setChargePreview(null);
        }
    }, [formData.entryPrice, formData.exitPrice, formData.underlying, formData.quantity, formData.direction, lotSize]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.underlying) newErrors.underlying = 'Required';
        if (!formData.strikePrice) newErrors.strikePrice = 'Required';
        if (!formData.expiryDate) newErrors.expiryDate = 'Required';
        if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'At least 1 lot';

        // Entry Details
        if (!formData.entryDate) newErrors.entryDate = 'Required';
        if (!formData.entryTime) newErrors.entryTime = 'Required';
        if (!formData.entryPrice) newErrors.entryPrice = 'Required';

        // Channel
        if (!formData.channel) newErrors.channel = 'Required';

        // Exit Details - Required if any exit field is filled OR if user intends to close trade
        // For now, simpler logic: if any exit field is filled, others are required.
        // OR if this is an update and status is closed (but status isn't directly in form state here easily without checking trade prop)
        // Let's rely on: if any exit field has value, all must have value.
        const hasExitData = formData.exitDate || formData.exitTime || formData.exitPrice;
        if (hasExitData) {
            if (!formData.exitDate) newErrors.exitDate = 'Required';
            if (!formData.exitTime) newErrors.exitTime = 'Required';
            if (!formData.exitPrice) newErrors.exitPrice = 'Required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSaving(true);
        try {
            const tradeData = {
                ...formData,
                strikePrice: parseFloat(formData.strikePrice),
                quantity: parseInt(formData.quantity),
                entryPrice: parseFloat(formData.entryPrice),
                spotAtEntry: formData.spotAtEntry ? parseFloat(formData.spotAtEntry) : null,
                exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
                spotAtExit: formData.spotAtExit ? parseFloat(formData.spotAtExit) : null,
                lotSize,
            };

            if (isEditing) {
                updateTrade(trade.id, tradeData);
            } else {
                addTrade(tradeData);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/trades');
            }
        } catch (error) {
            console.error('Error saving trade:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Trade Info */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Trade Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Select
                        label="Underlying"
                        name="underlying"
                        value={formData.underlying}
                        onChange={handleChange}
                        options={underlyingOptions}
                        placeholder="Select underlying"
                        error={errors.underlying}
                    />

                    <Select
                        label="Option Type"
                        name="optionType"
                        value={formData.optionType}
                        onChange={handleChange}
                        options={optionTypeOptions}
                    />

                    <Input
                        label="Strike Price"
                        name="strikePrice"
                        type="number"
                        value={formData.strikePrice}
                        onChange={handleChange}
                        placeholder="e.g., 24000"
                        error={errors.strikePrice}
                    />

                    <Input
                        label="Expiry Date"
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        error={errors.expiryDate}
                    />

                    <div>
                        <Input
                            label="Quantity (Lots)"
                            name="quantity"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            error={errors.quantity}
                        />
                        {lotSize > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                                Lot size: {lotSize} | Total: {lotSize * formData.quantity} shares
                            </p>
                        )}
                    </div>

                    <Select
                        label="Direction"
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        options={directionOptions}
                    />
                </div>
            </Card>

            {/* Entry Details */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Entry Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                        label="Entry Date"
                        name="entryDate"
                        type="date"
                        value={formData.entryDate}
                        onChange={handleChange}
                        error={errors.entryDate}
                    />

                    <Input
                        label="Entry Time"
                        name="entryTime"
                        type="time"
                        value={formData.entryTime}
                        onChange={handleChange}
                        error={errors.entryTime}
                    />

                    <Input
                        label="Entry Price (₹)"
                        name="entryPrice"
                        type="number"
                        step="0.05"
                        value={formData.entryPrice}
                        onChange={handleChange}
                        placeholder="Premium per share"
                        error={errors.entryPrice}
                    />

                    <Input
                        label="Spot Price at Entry"
                        name="spotAtEntry"
                        type="number"
                        step="0.05"
                        value={formData.spotAtEntry}
                        onChange={handleChange}
                        placeholder="Underlying price"
                    />
                </div>
            </Card>

            {/* Exit Details */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Exit Details (Required only if closing)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                        label="Exit Date"
                        name="exitDate"
                        type="date"
                        value={formData.exitDate}
                        onChange={handleChange}
                        error={errors.exitDate}
                    />

                    <Input
                        label="Exit Time"
                        name="exitTime"
                        type="time"
                        value={formData.exitTime}
                        onChange={handleChange}
                        error={errors.exitTime}
                    />

                    <Input
                        label="Exit Price (₹)"
                        name="exitPrice"
                        type="number"
                        step="0.05"
                        value={formData.exitPrice}
                        onChange={handleChange}
                        placeholder="Premium per share"
                        error={errors.exitPrice}
                    />

                    <Input
                        label="Spot Price at Exit"
                        name="spotAtExit"
                        type="number"
                        step="0.05"
                        value={formData.spotAtExit}
                        onChange={handleChange}
                        placeholder="Underlying price"
                    />
                </div>

                {/* Charges Preview */}
                {chargePreview && (
                    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <Calculator className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm font-medium text-slate-300">Charges Breakdown</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                                <span className="text-slate-500">Brokerage:</span>
                                <span className="ml-2 text-white">{formatCurrency(chargePreview.brokerage)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">STT:</span>
                                <span className="ml-2 text-white">{formatCurrency(chargePreview.stt)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Exchange:</span>
                                <span className="ml-2 text-white">{formatCurrency(chargePreview.exchangeCharges)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">GST:</span>
                                <span className="ml-2 text-white">{formatCurrency(chargePreview.gst)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">SEBI:</span>
                                <span className="ml-2 text-white">{formatCurrency(chargePreview.sebiCharges)}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Stamp Duty:</span>
                                <span className="ml-2 text-white">{formatCurrency(chargePreview.stampDuty)}</span>
                            </div>
                            <div className="col-span-2 md:col-span-2 font-semibold">
                                <span className="text-slate-300">Total Charges:</span>
                                <span className="ml-2 text-indigo-400">{formatCurrency(chargePreview.total)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Strategy & Tags */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Strategy</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Strategy Type"
                        name="strategy"
                        value={formData.strategy}
                        onChange={handleChange}
                        options={STRATEGIES}
                    />

                    <Input
                        label="Tags (comma-separated)"
                        name="tagInput"
                        value={formData.tags?.join(', ') || ''}
                        onChange={(e) => {
                            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                            setFormData(prev => ({ ...prev, tags }));
                        }}
                        placeholder="e.g., breakout, earnings, momentum"
                    />

                    <Select
                        label="Trade Channel"
                        name="channel"
                        value={formData.channel}
                        onChange={handleChange}
                        options={TRADE_CHANNELS.map(c => ({ value: c, label: c }))}
                        placeholder="Select channel"
                        error={errors.channel}
                    />
                </div>
            </Card>

            {/* Journal */}
            <Card>
                <h3 className="text-lg font-semibold text-white mb-4">Journal</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Trade Rationale
                        </label>
                        <textarea
                            name="rationale"
                            value={formData.rationale}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Why did you take this trade?"
                        />
                    </div>

                    <Select
                        label="Emotional State"
                        name="emotions"
                        value={formData.emotions}
                        onChange={handleChange}
                        options={EMOTIONS.map(e => ({ value: e.value, label: e.label }))}
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Lessons Learned
                        </label>
                        <textarea
                            name="lessonsLearned"
                            value={formData.lessonsLearned}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="What did you learn from this trade?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Trade Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                    className={`text-2xl transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-slate-600'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Any other notes..."
                        />
                    </div>
                </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    icon={X}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    loading={saving}
                    icon={Save}
                >
                    {isEditing ? 'Update Trade' : 'Save Trade'}
                </Button>
            </div>
        </form>
    );
};

export default TradeForm;
