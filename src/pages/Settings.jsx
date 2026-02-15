import { useState } from 'react';
import { Download, Trash2, AlertTriangle, Sun, Moon } from 'lucide-react';
import { Button, Card, CardTitle, Input, Modal } from '../components/common';
import { useTheme } from '../context/ThemeContext';
import { useTrades } from '../context/TradesContext';
import { exportTradesCSV, exportTradesJSON, createBackup } from '../utils/storage';

const Settings = () => {
    const { theme, toggleTheme, settings, updateSettings } = useTheme();
    const { trades, clearAllTrades } = useTrades();

    const [showClearModal, setShowClearModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleExportCSV = () => {
        const csv = exportTradesCSV();
        downloadFile(csv, 'trades.csv', 'text/csv');
    };

    const handleExportJSON = () => {
        const json = exportTradesJSON();
        downloadFile(json, 'trades.json', 'application/json');
    };

    const handleBackup = () => {
        const backup = createBackup();
        const json = JSON.stringify(backup, null, 2);
        downloadFile(json, `options-journal-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    };

    const downloadFile = (content, filename, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClearData = () => {
        if (confirmText === 'DELETE ALL') {
            clearAllTrades();
            setShowClearModal(false);
            setConfirmText('');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Manage your preferences and data</p>
            </div>

            {/* Appearance */}
            <Card>
                <CardTitle className="mb-4">Appearance</CardTitle>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Theme</p>
                        <p className="text-slate-400 text-sm">Switch between light and dark mode</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5 text-yellow-400" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-400" />
                        )}
                    </button>
                </div>
            </Card>

            {/* Broker Settings */}
            <Card>
                <CardTitle className="mb-4">Broker Settings</CardTitle>
                <div className="space-y-4">
                    <div>
                        <p className="text-white font-medium mb-1">Broker</p>
                        <p className="text-slate-400 text-sm mb-2">Used for charge calculations</p>
                        <div className="flex gap-2">
                            {['groww', 'zerodha', 'upstox', 'angel'].map((broker) => (
                                <button
                                    key={broker}
                                    onClick={() => updateSettings({ broker })}
                                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${settings.broker === broker
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    {broker}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-white font-medium mb-1">Brokerage per Order (₹)</p>
                        <p className="text-slate-400 text-sm mb-2">Flat fee charged per order</p>
                        <Input
                            type="number"
                            value={settings.brokerage}
                            onChange={(e) => updateSettings({ brokerage: parseFloat(e.target.value) || 0 })}
                            className="max-w-[150px]"
                        />
                    </div>
                </div>
            </Card>

            {/* Data Export */}
            <Card>
                <CardTitle className="mb-4">Export Data</CardTitle>
                <p className="text-slate-400 text-sm mb-4">
                    Download your trades for backup or analysis. You have {trades.length} trades.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
                        Export CSV
                    </Button>
                    <Button variant="secondary" onClick={handleExportJSON} icon={Download}>
                        Export JSON
                    </Button>
                    <Button variant="secondary" onClick={handleBackup} icon={Download}>
                        Full Backup
                    </Button>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/30 bg-red-500/5">
                <CardTitle className="mb-4 text-red-400">Danger Zone</CardTitle>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Delete All Data</p>
                        <p className="text-slate-400 text-sm">
                            Permanently delete all trades. This cannot be undone.
                        </p>
                    </div>
                    <Button
                        variant="danger"
                        onClick={() => setShowClearModal(true)}
                        icon={Trash2}
                        disabled={trades.length === 0}
                    >
                        Delete All
                    </Button>
                </div>
            </Card>

            {/* Storage Info */}
            <Card>
                <CardTitle className="mb-4">Storage Information</CardTitle>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Total Trades</span>
                        <span className="text-white">{trades.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Storage Location</span>
                        <span className="text-white">Browser localStorage</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Estimated Size</span>
                        <span className="text-white">
                            {(JSON.stringify(trades).length / 1024).toFixed(1)} KB
                        </span>
                    </div>
                </div>
                <p className="text-yellow-400 text-xs mt-4">
                    ⚠️ Data is stored in your browser. Clearing browser data will delete your trades.
                    Export regularly for backup.
                </p>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showClearModal}
                onClose={() => {
                    setShowClearModal(false);
                    setConfirmText('');
                }}
                title="Delete All Data"
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowClearModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleClearData}
                            disabled={confirmText !== 'DELETE ALL'}
                        >
                            Delete Everything
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-red-400 font-medium">This action cannot be undone!</p>
                            <p className="text-slate-400 mt-1">
                                All {trades.length} trades will be permanently deleted.
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-slate-300 text-sm mb-2">
                            Type <strong className="text-white">DELETE ALL</strong> to confirm:
                        </p>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE ALL"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;
