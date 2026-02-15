import { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings, getDefaultSettings } from '../utils/storage';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [settings, setSettings] = useState(getDefaultSettings);

    // Load settings on mount
    useEffect(() => {
        const savedSettings = getSettings();
        setSettings(savedSettings);
        setTheme(savedSettings.theme || 'dark');
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        const newSettings = { ...settings, theme: newTheme };
        setSettings(newSettings);
        saveSettings(newSettings);
    };

    const updateSettings = (updates) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        saveSettings(newSettings);

        if (updates.theme) {
            setTheme(updates.theme);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: theme === 'dark',
                toggleTheme,
                settings,
                updateSettings,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
