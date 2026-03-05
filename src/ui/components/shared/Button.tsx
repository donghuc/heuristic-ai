import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth, className = '', children, ...props }: Props) {
    const base = [
        'inline-flex items-center justify-center gap-2',
        'h-8 px-4',
        'text-[13px] font-semibold rounded-md',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-figma-blue/50',
        'select-none',
    ].join(' ');

    const variants = {
        primary: [
            'bg-figma-blue text-white',
            'hover:bg-figma-blueHover active:scale-[0.98]',
            'disabled:bg-figma-border disabled:text-figma-textDisabled disabled:cursor-not-allowed disabled:scale-100',
        ].join(' '),
        secondary: [
            'bg-transparent border border-figma-border text-figma-text',
            'hover:bg-figma-hover hover:border-figma-textMuted active:scale-[0.98]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
        ].join(' '),
    };

    const fw = fullWidth ? 'w-full' : '';

    return (
        <button className={`${base} ${variants[variant]} ${fw} ${className}`} {...props}>
            {children}
        </button>
    );
}
