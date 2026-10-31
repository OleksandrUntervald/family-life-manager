'use client';

import { useState, useEffect, useCallback } from 'react';
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
    receiptUrl?: string;
}

interface Summary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function FinancePage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Стани для фільтрів, сортування та пагінації
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setErrorMsg(null);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                sortBy,
                sortOrder,
                type: filterType,
                ...(filterCategory && { category: filterCategory }),
            });

            const [txRes, sumRes] = await Promise.all([
                api.get(`/api/finance?${queryParams.toString()}`),
                api.get('/api/finance/summary')
            ]);

            setTransactions(txRes.data.data);
            setMeta(txRes.data.meta);
            setSummary(sumRes.data);
        } catch (error: any) {
            console.error('Помилка завантаження', error);
            if (error.response?.status === 401) {
                router.push('/login');
            } else {
                setErrorMsg('Не вдалося завантажити дані. Спробуйте пізніше.');
            }
        } finally {
            setLoading(false);
        }
    }, [page, sortBy, sortOrder, filterType, filterCategory, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('amount', formData.amount);
        payload.append('type', formData.type);
        payload.append('category', formData.category);
        if (file) payload.append('file', file);

        try {
            if (editingId) {
                await api.patch(`/api/finance/${editingId}`, payload);
                setEditingId(null);
            } else {
                await api.post('/api/finance', payload);
            }

            setFormData({ title: '', amount: '', type: 'expense', category: '' });
            setFile(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            setPage(1); // Скидаємо на першу сторінку після додавання
            fetchData();
        } catch (error: any) {
            console.error('Помилка збереження', error);
            setErrorMsg(error.response?.data?.message || 'Не вдалося зберегти транзакцію. Перевірте введені дані.');
        }
    };

    const startEdit = (tx: Transaction) => {
        setEditingId(tx._id);
        setFormData({ title: tx.title, amount: tx.amount.toString(), type: tx.type, category: tx.category });
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', amount: '', type: 'expense', category: '' });
        setFile(null);
        setErrorMsg(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей запис?')) return;

        try {
            setErrorMsg(null);
            await api.delete(`/api/finance/${id}`);
            if (editingId === id) cancelEdit();

            // Якщо видалили останній елемент на сторінці - переходимо на попередню
            if (transactions.length === 1 && page > 1) {
                setPage(p => p - 1);
            } else {
                fetchData();
            }
        } catch (error: any) {
            console.error('Помилка видалення', error);
            setErrorMsg(error.response?.data?.message || 'Не вдалося видалити транзакцію.');
        }
    };

    // Скидання сторінки при зміні фільтрів
    const handleFilterChange = () => {
        setPage(1);
    };

    if (loading && page === 1) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Фінанси</h1>
                    <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                        На головну
                    </Link>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium shadow-sm">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800 font-medium">
                                Скасувати
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                                <input type="text" required placeholder="Заправка Mazda 3..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Сума (₴)</label>
                                <input type="number" required min="0.01" step="0.01" placeholder="1000" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                <input type="text" required placeholder="Авто, Дім..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-white" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}>
                                    <option value="expense">Витрата</option>
                                    <option value="income">Дохід</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 gap-4">
                            <div className="w-full sm:w-auto">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Фото чека (необов'язково)</label>
                                <input id="file-upload" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full" />
                            </div>
                            <button type="submit" className={`w-full sm:w-auto px-8 py-2 text-white font-semibold rounded-lg transition-colors h-[42px] ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {editingId ? 'Зберегти' : 'Додати транзакцію'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ПАНЕЛЬ ФІЛЬТРІВ ТА СОРТУВАННЯ */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); handleFilterChange(); }}
                            className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 outline-none"
                        >
                            <option value="all">Всі типи</option>
                            <option value="income">Тільки доходи</option>
                            <option value="expense">Тільки витрати</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Пошук за категорією..."
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); handleFilterChange(); }}
                            className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 outline-none flex-grow md:w-48"
                        />
                    </div>

                    <div className="flex gap-2 items-center w-full md:w-auto">
                        <span className="text-sm text-gray-500 font-medium">Сортування:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 outline-none"
                        >
                            <option value="createdAt">За датою</option>
                            <option value="amount">За сумою</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                            title="Змінити напрямок сортування"
                        >
                            {sortOrder === 'desc' ? '⬇️' : '⬆️'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-medium">Записів не знайдено.</div>
                    ) : (
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
                                            <button onClick={() => startEdit(tx)} className="text-amber-500 hover:text-amber-700 font-medium p-2 text-sm bg-amber-50 rounded-lg hover:bg-amber-100" title="Редагувати">
                                                ✎
                                            </button>
                                            <button onClick={() => handleDelete(tx._id)} className="text-red-500 hover:text-red-700 font-medium p-2 bg-red-50 rounded-lg hover:bg-red-100" title="Видалити">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ПАГІНАЦІЯ */}
                {meta.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            ← Назад
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Сторінка {meta.page} з {meta.totalPages}
                        </span>
                        <button
                            disabled={page === meta.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            Далі →
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}