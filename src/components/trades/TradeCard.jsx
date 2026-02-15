import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Clock, ChevronRight } from 'lucide-react';
import { Card } from '../common';
import { formatCurrency } from '../../utils/charges';
import { getStrategyLabel } from '../../utils/constants';

const TradeCard = ({ trade }) => {
    const navigate = useNavigate();

    const isProfitable = trade.netPnL > 0;
    const isOpen = trade.status === 'OPEN';

    const handleClick = () => {
        navigate(`/trades/${trade.id}`);
    };

    return (
        <Card hover onClick={handleClick} className="animate-fade-in">
            <div className="flex items-start justify-between">
                {/* Left: Trade info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {/* Symbol badge */}
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {trade.underlying}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${trade.optionType === 'CE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            }`}>
                            {trade.strikePrice} {trade.optionType}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${trade.direction === 'BUY'
                            ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                            : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                            }`}>
                            {trade.direction}
                        </span>
                    </div>

                    {/* Trade details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>Expiry: {trade.expiryDate ? format(parseISO(trade.expiryDate), 'dd MMM') : '-'}</span>
                        <span>{trade.quantity} lot{trade.quantity > 1 ? 's' : ''}</span>
                        <span>{getStrategyLabel(trade.strategy)}</span>
                    </div>

                    {/* Entry/Exit prices */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 text-sm">
                        <div className="flex items-center gap-1">
                            <span className="text-slate-500 dark:text-slate-500">Cap:</span>
                            <span className="text-slate-700 dark:text-slate-300">
                                {formatCurrency(trade.capitalUsed > 0 ? trade.capitalUsed : (trade.entryPrice * trade.lotSize * trade.quantity))}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-500">Entry:</span>
                            <span className="ml-1 text-slate-900 dark:text-white">₹{trade.entryPrice}</span>
                        </div>
                        {trade.exitPrice && (
                            <div>
                                <span className="text-slate-500 dark:text-slate-500">Exit:</span>
                                <span className="ml-1 text-slate-900 dark:text-white">₹{trade.exitPrice}</span>
                            </div>
                        )}
                        <div className="text-slate-400 dark:text-slate-500 text-xs">
                            {trade.entryDate ? format(parseISO(trade.entryDate), 'dd MMM') : ''}
                        </div>
                    </div>

                    {/* Tags */}
                    {trade.tags && trade.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {trade.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 rounded text-xs text-slate-600 dark:text-slate-400"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {trade.tags.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-slate-500">
                                    +{trade.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: P&L */}
                <div className="flex flex-col items-end">
                    {isOpen ? (
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Open</span>
                        </div>
                    ) : (
                        <>
                            <div className={`flex items-center gap-1 ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {isProfitable ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                <span className="text-lg font-bold">
                                    {formatCurrency(trade.netPnL)}
                                </span>
                            </div>

                            {/* Percentage */}
                            {trade.grossPnL !== undefined && trade.entryPrice && (
                                <span className={`text-xs ${isProfitable ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'
                                    }`}>
                                    {isProfitable ? '+' : ''}
                                    {((trade.grossPnL / (trade.entryPrice * trade.lotSize * trade.quantity)) * 100).toFixed(1)}%
                                </span>
                            )}
                        </>
                    )}

                    {/* Rating stars */}
                    {trade.rating && (
                        <div className="mt-2 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-xs ${trade.rating >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    )}

                    <ChevronRight className="h-5 w-5 text-slate-600 mt-2" />
                </div>
            </div>
        </Card>
    );
};

export default TradeCard;
