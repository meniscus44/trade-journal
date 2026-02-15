import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Button, Card, CardTitle, Modal } from '../components/common';
import { TradeForm } from '../components/trades';
import { useTrades } from '../context/TradesContext';
import { formatCurrency } from '../utils/charges';
import { getStrategyLabel, getEmotionData } from '../utils/constants';

const TradeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getTradeById, deleteTrade } = useTrades();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const trade = getTradeById(id);

    if (!trade) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-400">Trade not found</p>
                <Button variant="ghost" onClick={() => navigate('/trades')} className="mt-4">
                    Back to Trades
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        deleteTrade(id);
        navigate('/trades');
    };

    const emotion = getEmotionData(trade.emotions);
    const isOpen = trade.status === 'OPEN';
    const isProfitable = trade.netPnL > 0;

    if (isEditing) {
        return (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} icon={ArrowLeft}>
                        Cancel Edit
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Edit Trade</h1>
                </div>
                <TradeForm trade={trade} onSuccess={() => setIsEditing(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/trades')} icon={ArrowLeft}>
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white">{trade.underlying}</h1>
                            <span className={`px-2 py-0.5 rounded text-sm font-medium ${trade.optionType === 'CE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                                }`}>
                                {trade.strikePrice} {trade.optionType}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-sm font-medium ${isOpen ? 'bg-yellow-500/20 text-yellow-400' :
                                isProfitable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {isOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        <p className="text-slate-400">
                            {trade.direction} • {trade.quantity} lot{trade.quantity > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsEditing(true)} icon={Edit2}>
                        Edit
                    </Button>
                    <Button variant="danger" onClick={() => setShowDeleteModal(true)} icon={Trash2}>
                        Delete
                    </Button>
                </div>
            </div>

            {/* P&L Summary */}
            {!isOpen && (
                <Card className={`${isProfitable
                    ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border-emerald-500/30'
                    : 'bg-gradient-to-r from-red-600/20 to-red-600/5 border-red-500/30'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Net P&L</p>
                            <p className={`text-4xl font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(trade.netPnL)}
                            </p>
                            <p className="text-slate-500 text-sm mt-1">
                                Gross: {formatCurrency(trade.grossPnL)} • Charges: {formatCurrency(trade.charges?.total || 0)}
                            </p>
                        </div>
                        {isProfitable ? (
                            <TrendingUp className="h-16 w-16 text-emerald-400/30" />
                        ) : (
                            <TrendingDown className="h-16 w-16 text-red-400/30" />
                        )}
                    </div>
                </Card>
            )}

            {/* Trade Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entry Details */}
                <Card>
                    <CardTitle className="mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        Entry Details
                    </CardTitle>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Date</span>
                            <span className="text-white flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                {trade.entryDate ? format(parseISO(trade.entryDate), 'dd MMM yyyy') : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Time</span>
                            <span className="text-white flex items-center gap-1">
                                <Clock className="h-4 w-4 text-slate-500" />
                                {trade.entryTime || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Entry Price</span>
                            <span className="text-white">₹{trade.entryPrice}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Capital Used</span>
                            <span className="text-indigo-400 font-medium">
                                {formatCurrency(trade.capitalUsed > 0 ? trade.capitalUsed : (trade.entryPrice * trade.lotSize * trade.quantity))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Spot at Entry</span>
                            <span className="text-white">{trade.spotAtEntry || '-'}</span>
                        </div>
                    </div>
                </Card>

                {/* Exit Details */}
                <Card>
                    <CardTitle className="mb-4 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-yellow-400' : 'bg-red-400'}`} />
                        Exit Details
                    </CardTitle>
                    {isOpen ? (
                        <p className="text-slate-500">Trade is still open</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Date</span>
                                <span className="text-white flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    {trade.exitDate ? format(parseISO(trade.exitDate), 'dd MMM yyyy') : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Time</span>
                                <span className="text-white flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    {trade.exitTime || '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Exit Price</span>
                                <span className="text-white">₹{trade.exitPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Spot at Exit</span>
                                <span className="text-white">{trade.spotAtExit || '-'}</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Charges Breakdown */}
            {trade.charges && (
                <Card>
                    <CardTitle className="mb-4">Charges Breakdown</CardTitle>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span className="text-slate-400 text-sm">Brokerage</span>
                            <p className="text-white font-medium">{formatCurrency(trade.charges.brokerage)}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">STT</span>
                            <p className="text-white font-medium">{formatCurrency(trade.charges.stt)}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Exchange</span>
                            <p className="text-white font-medium">{formatCurrency(trade.charges.exchangeCharges)}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">GST</span>
                            <p className="text-white font-medium">{formatCurrency(trade.charges.gst)}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">SEBI</span>
                            <p className="text-white font-medium">{formatCurrency(trade.charges.sebiCharges)}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Stamp Duty</span>
                            <p className="text-white font-medium">{formatCurrency(trade.charges.stampDuty)}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-slate-400 text-sm">Total Charges</span>
                            <p className="text-indigo-400 font-bold text-lg">{formatCurrency(trade.charges.total)}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Strategy & Tags */}
            <Card>
                <CardTitle className="mb-4">Strategy</CardTitle>
                <div className="space-y-4">
                    <div>
                        <span className="text-slate-400 text-sm">Strategy Type</span>
                        <p className="text-white font-medium">{getStrategyLabel(trade.strategy)}</p>
                    </div>
                    {trade.channel && (
                        <div>
                            <span className="text-slate-400 text-sm">Trade Channel</span>
                            <p className="text-white font-medium">{trade.channel}</p>
                        </div>
                    )}
                    {trade.tags && trade.tags.length > 0 && (
                        <div>
                            <span className="text-slate-400 text-sm">Tags</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {trade.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Journal */}
            <Card>
                <CardTitle className="mb-4">Journal</CardTitle>
                <div className="space-y-4">
                    {trade.rationale && (
                        <div>
                            <span className="text-slate-400 text-sm">Trade Rationale</span>
                            <p className="text-white mt-1">{trade.rationale}</p>
                        </div>
                    )}

                    <div>
                        <span className="text-slate-400 text-sm">Emotional State</span>
                        <p className={`font-medium mt-1 ${emotion.color}`}>{emotion.label}</p>
                    </div>

                    {trade.lessonsLearned && (
                        <div>
                            <span className="text-slate-400 text-sm">Lessons Learned</span>
                            <p className="text-white mt-1">{trade.lessonsLearned}</p>
                        </div>
                    )}

                    {trade.rating && (
                        <div>
                            <span className="text-slate-400 text-sm">Rating</span>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={`text-xl ${trade.rating >= star ? 'text-yellow-400' : 'text-slate-600'}`}>
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {trade.notes && (
                        <div>
                            <span className="text-slate-400 text-sm">Notes</span>
                            <p className="text-white mt-1">{trade.notes}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Trade"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p className="text-slate-300">
                    Are you sure you want to delete this trade? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default TradeDetail;
