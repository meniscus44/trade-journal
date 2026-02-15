import { TradeForm } from '../components/trades';

const NewTrade = () => {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Add New Trade</h1>
                <p className="text-slate-400">Log your F&O trade with all the details</p>
            </div>

            {/* Trade Form */}
            <TradeForm />
        </div>
    );
};

export default NewTrade;
