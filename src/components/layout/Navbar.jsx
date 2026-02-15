import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';

const Navbar = ({ onMenuClick }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between h-16 px-4">
                {/* Left side */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">OJ</span>
                        </div>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">
                            Options Journal
                        </span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="!p-2 text-slate-500 dark:text-slate-400"
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-400" />
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
