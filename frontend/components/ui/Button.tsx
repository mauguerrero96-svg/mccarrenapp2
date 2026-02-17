import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    href?: string;
    isLoading?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    className = '',
    href,
    isLoading,
    disabled,
    ...props
}: ButtonProps) {
    // Base classes mapping
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        ghost: 'inline-flex items-center justify-center px-4 py-2 bg-transparent hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-all duration-200',
    };

    const baseClass = variants[variant] || variants.primary;
    const loadingClass = isLoading ? 'opacity-75 cursor-not-allowed' : '';
    const finalClass = `${baseClass} ${loadingClass} ${className}`;

    if (href) {
        return (
            <Link href={href} className={finalClass}>
                {children}
            </Link>
        );
    }

    return (
        <button
            className={finalClass}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {children}
                </div>
            ) : (
                children
            )}
        </button>
    );
}
