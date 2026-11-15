import React from 'react';
import { Transaction } from '@/types';

interface TransactionListProps {
    transactions: Transaction[];
    editingId: string | null;
    onEdit: (tx: Transaction) => void;
    onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, editingId, onEdit, onDelete }) => {
    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center text-gray-500 font-medium">
                Записів не знайдено.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                    <li key={tx._id} className={`p-4 flex justify-between items-center transition-colors group ${editingId === tx._id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 text-lg">{tx.title}</h3>
                                {tx.receiptUrl && (
                                    <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-200 hover:bg-blue-100 transition-colors">
                                        🧾 Чек
                                    </a>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium mr-2 border border-gray-200">{tx.category}</span>
                                {new Date(tx.createdAt).toLocaleDateString('uk-UA')}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} ₴
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(tx)} className="text-amber-500 hover:text-amber-700 font-medium p-2 text-sm bg-amber-50 rounded-lg hover:bg-amber-100">
                                    ✎
                                </button>
                                <button onClick={() => onDelete(tx._id)} className="text-red-500 hover:text-red-700 font-medium p-2 bg-red-50 rounded-lg hover:bg-red-100">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};