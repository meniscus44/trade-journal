import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    showCloseButton = true,
}) => {
    const modalRef = useRef(null);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw]',
    };

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`
          relative w-full ${sizes[size]} mx-4
          bg-white dark:bg-slate-800 
          border border-slate-200 dark:border-slate-700
          rounded-xl shadow-2xl
          animate-slide-up
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                    {showCloseButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="!p-1 text-slate-500 dark:text-slate-400"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 max-h-[70vh] overflow-y-auto text-slate-900 dark:text-slate-300">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
