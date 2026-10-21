'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

interface Transaction {
    _id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    createdAt: string;
}

interface Summary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export default function FinancePage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    // Стан для редагування
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: ''
    });

    const fetchData = async () => {
        try {
            const [txRes, sumRes] = await Promise.all([
                api.get('/api/finance'),
                api.get('/api/finance/summary')
            ]);
            setTransactions(txRes.data);
            setSummary(sumRes.data);
        } catch (error) {
            console.error('Помилка завантаження', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: formData.title,
            amount: Number(formData.amount),
            type: formData.type,
            category: formData.category,
        };

        try {
            if (editingId) {
                await api.patch(`/api/finance/${editingId}`, payload);
                setEditingId(null);
            } else {
                await api.post('/api/finance', payload);
            }
            setFormData({ title: '', amount: '', type: 'expense', category: '' });
            fetchData();
        } catch (error) {
            console.error('Помилка збереження', error);
        }
    };

    const startEdit = (tx: Transaction) => {
        setEditingId(tx._id);
        setFormData({
            title: tx.title,
            amount: tx.amount.toString(),
            type: tx.type,
            category: tx.category
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', amount: '', type: 'expense', category: '' });
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/finance/${id}`);
            if (editingId === id) cancelEdit();
            fetchData();
        } catch (error) {
            console.error('Помилка видалення', error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Фінанси</h1>
                    <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        На головну
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Загальний дохід</p>
                        <p className="text-2xl font-bold text-green-600">+{summary.totalIncome.toLocaleString()} ₴</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Загальні витрати</p>
                        <p className="text-2xl font-bold text-red-600">-{summary.totalExpense.toLocaleString()} ₴</p>
                    </div>
                    <div className={`p-4 rounded-xl shadow-sm border ${summary.balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-sm text-gray-700 mb-1">Поточний баланс</p>
                        <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {summary.balance.toLocaleString()} ₴
                        </p>
                    </div>
                </div>

                <div className={`bg-white p-6 rounded-xl shadow-md border ${editingId ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {editingId ? 'Редагування транзакції' : 'Нова транзакція'}
                        </h2>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800">
                                Скасувати
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                            <input
                                type="text"
                                required
                                placeholder="Заправка Mazda 3, Фільтр Ecosoft..."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Сума (₴)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                placeholder="1000"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                            <input
                                type="text"
                                required
                                placeholder="Авто, Дім..."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                            >
                                <option value="expense">Витрата</option>
                                <option value="income">Дохід</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors h-[42px] ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {editingId ? 'Зберегти' : 'Додати'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Немає транзакцій. Додай першу!</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <li key={tx._id} className={`p-4 flex justify-between items-center transition-colors group ${editingId === tx._id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{tx.title}</h3>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium mr-2">{tx.category}</span>
                                            {new Date(tx.createdAt).toLocaleDateString('uk-UA')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} ₴
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(tx)} className="text-amber-500 hover:text-amber-700 font-medium p-2 text-sm" title="Редагувати">
                                                ✎
                                            </button>
                                            <button onClick={() => handleDelete(tx._id)} className="text-red-400 hover:text-red-600 font-medium p-2" title="Видалити">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}