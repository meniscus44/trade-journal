import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    className = '',
    containerClassName = '',
    type = 'text',
    icon: Icon,
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
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`
            w-full px-3 py-2 
            bg-white dark:bg-slate-800 
            border border-slate-300 dark:border-slate-700 
            rounded-lg text-slate-900 dark:text-white 
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
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

Input.displayName = 'Input';

export default Input;
