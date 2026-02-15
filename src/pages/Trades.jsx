import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '../components/common';
import { TradeList } from '../components/trades';
import { useTrades } from '../context/TradesContext';

const Trades = () => {
    const { trades, loading } = useTrades();

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
                    <h1 className="text-2xl font-bold text-white">Trades</h1>
                    <p className="text-slate-400">
                        {trades.length} total trade{trades.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link to="/new-trade">
                    <Button icon={PlusCircle}>
                        Add Trade
                    </Button>
                </Link>
            </div>

            {/* Trade List */}
            <TradeList trades={trades} />
        </div>
    );
};

export default Trades;
