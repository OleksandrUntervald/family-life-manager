import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  isLoading,
                                                  className = '',
                                                  ...props
                                              }) => {
    const baseStyle = "px-6 py-2.5 font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
        ghost: "bg-transparent text-gray-500 hover:text-gray-800 shadow-none hover:bg-gray-100"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
            {isLoading ? <span className="animate-spin text-lg">⏳</span> : null}
            {children}
        </button>
    );
};