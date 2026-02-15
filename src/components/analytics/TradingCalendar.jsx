import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, getDay, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardTitle, Button } from '../common';
import { isHoliday, ALL_HOLIDAYS } from '../../utils/constants';
import { formatCurrency } from '../../utils/charges';
import { getCalendarData } from '../../utils/calculations';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TradingCalendar = ({ trades = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const goToToday = () => setCurrentMonth(new Date());

    // Calculate calendar data for the current month
    const calendarData = useMemo(() => {
        return getCalendarData(trades, currentMonth);
    }, [trades, currentMonth]);

    // Get the first day of the month and calculate padding
    const firstDayOfMonth = startOfMonth(currentMonth);
    const startingDayOfWeek = getDay(firstDayOfMonth);

    // Create a lookup for the calendar data
    const dataByDate = {};
    calendarData.forEach(day => {
        dataByDate[day.dateStr] = day;
    });

    // Generate calendar grid
    const calendarDays = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Add the actual days
    calendarData.forEach(day => {
        calendarDays.push(day);
    });

    const getColorClass = (pnl, tradeCount) => {
        if (tradeCount === 0) return 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50';
        if (pnl > 5000) return 'bg-emerald-100 dark:bg-emerald-500/40 border border-emerald-200 dark:border-emerald-500/30';
        if (pnl > 0) return 'bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/20';
        if (pnl > -5000) return 'bg-red-50 dark:bg-red-500/20 border border-red-100 dark:border-red-500/20';
        return 'bg-red-100 dark:bg-red-500/40 border border-red-200 dark:border-red-500/30';
    };

    return (
        <Card>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <CardTitle>Trading Calendar</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-medium min-w-[120px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={goToToday}>
                        Today
                    </Button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map(day => (
                    <div
                        key={day}
                        className={`text-center text-xs font-medium py-2 ${day === 'Sat' || day === 'Sun' ? 'text-slate-600' : 'text-slate-400'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dateStr = day.dateStr;
                    const holiday = isHoliday(dateStr);
                    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                    const isTodayDate = isToday(day.date);

                    // Generate tooltip
                    let tooltip = format(day.date, 'EEEE, MMM d, yyyy');
                    if (holiday) tooltip += '\n📅 Trading Holiday';
                    if (day.tradeCount > 0) {
                        tooltip += `\n\n📊 Net P&L: ${formatCurrency(day.pnl)}`;
                        tooltip += `\n🔢 Trades: ${day.tradeCount}`;
                        tooltip += `\n\nDetailed Breakdown:`;
                        day.trades?.forEach(t => {
                            tooltip += `\n• ${t.underlying} ${t.type || 'OPT'}: ${formatCurrency(t.netPnL)}`;
                        });
                    } else if (!holiday && !isWeekend) {
                        tooltip += '\nNo trades recorded';
                    }

                    return (
                        <div
                            key={dateStr}
                            className={`
                aspect-square rounded-lg relative group
                transition-all duration-200 cursor-default
                flex flex-col items-center justify-center
                ${holiday ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50' : getColorClass(day.pnl, day.tradeCount)}
                ${isTodayDate ? 'ring-2 ring-indigo-500 z-10' : ''}
                ${isWeekend && !holiday ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/30' : ''}
              `}
                            title={tooltip}
                        >
                            <span className={`text-[10px] sm:text-xs font-medium mb-0.5 ${holiday ? 'text-red-600 dark:text-red-400' :
                                isTodayDate ? 'text-indigo-600 dark:text-indigo-400' :
                                    'text-slate-700 dark:text-slate-400'
                                }`}>
                                {day.day}
                            </span>

                            {day.tradeCount > 0 && (
                                <>
                                    <div className={`text-[10px] sm:text-xs font-bold leading-tight ${day.pnl >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                                        }`}>
                                        {(day.pnl / 1000).toFixed(1)}k
                                    </div>
                                    <div className="flex gap-0.5 mt-1">
                                        {Array.from({ length: Math.min(day.tradeCount, 4) }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${day.pnl >= 0 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-600 dark:bg-red-500'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-500/40 border border-emerald-200 dark:border-emerald-500/30" />
                    <span>Large Profit</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/20" />
                    <span>Small Profit</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-50 dark:bg-red-500/20 border border-red-100 dark:border-red-500/20" />
                    <span>Small Loss</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-500/40 border border-red-200 dark:border-red-500/30" />
                    <span>Large Loss</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50" />
                    <span>Holiday</span>
                </div>
            </div>
        </Card>
    );
};

export default TradingCalendar;
