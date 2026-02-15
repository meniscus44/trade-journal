import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`space-y-1 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    className={`
            w-full px-3 py-2 pr-10
            bg-white dark:bg-slate-800 
            border border-slate-300 dark:border-slate-700 
            rounded-lg text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                >
                    <option value="" className="bg-white dark:bg-slate-800">{placeholder}</option>
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-white dark:bg-slate-800"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
            </div>
            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-slate-500">{helperText}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
