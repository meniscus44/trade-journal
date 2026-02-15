export const Card = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick,
    ...props
}) => {
    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            onClick={onClick}
            className={`
        bg-white dark:bg-slate-800/50 backdrop-blur-sm
        border border-slate-200 dark:border-slate-700/50
        rounded-xl
        ${paddings[padding]}
        ${hover ? 'hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-slate-900 dark:text-white ${className}`}>
        {children}
    </h3>
);

export const CardDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`}>
        {children}
    </p>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 ${className}`}>
        {children}
    </div>
);

export default Card;
