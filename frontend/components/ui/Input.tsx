import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                className={`p-3 bg-white border rounded-xl focus:ring-2 outline-none text-gray-800 transition-all
                    ${error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-500'} 
                    ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
    );
};