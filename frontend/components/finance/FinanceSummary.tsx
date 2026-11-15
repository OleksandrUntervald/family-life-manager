import React from 'react';
import { Summary } from '@/types';

interface FinanceSummaryProps {
    summary: Summary;
    viewMode: 'personal' | 'family';
}

export const FinanceSummary: React.FC<FinanceSummaryProps> = ({ summary, viewMode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Дохід ({viewMode === 'family' ? 'родини' : 'особистий'})</p>
                <p className="text-2xl font-bold text-green-600">+{summary.totalIncome.toLocaleString()} ₴</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Витрати ({viewMode === 'family' ? 'родини' : 'особисті'})</p>
                <p className="text-2xl font-bold text-red-600">-{summary.totalExpense.toLocaleString()} ₴</p>
            </div>
            <div className={`p-4 rounded-xl shadow-sm border ${summary.balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm text-gray-700 mb-1">Баланс</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {summary.balance.toLocaleString()} ₴
                </p>
            </div>
        </div>
    );
};