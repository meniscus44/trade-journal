import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrades } from '../../context/TradesContext';
import {
    LayoutDashboard,
    List,
    PlusCircle,
    BarChart2,
    Settings,
    Menu,
    X,
    Wallet,
    LogIn,
    LogOut
} from 'lucide-react';


const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Trades', icon: List, path: '/trades' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Capital', icon: Wallet, path: '/capital' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/auth');
    };



    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
            >
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 font-medium
                ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-600 dark:text-white dark:shadow-lg dark:shadow-indigo-600/25'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                }
              `}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="truncate">{user.email}</span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/auth"
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In / Sign Up
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
