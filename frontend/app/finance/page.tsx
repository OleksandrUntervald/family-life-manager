'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/config/api';
import { Transaction, Summary, Meta } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FinanceSummary } from '@/components/finance/FinanceSummary';
import { FinanceFilters } from '@/components/finance/FinanceFilters';
import { TransactionList } from '@/components/finance/TransactionList';

export default function FinancePage() {
    const [viewMode, setViewMode] = useState<'personal' | 'family'>('personal');

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
    });

    const fetchData = useCallback(async () => {
        try {
            setErrorMsg(null);
            setLoading(true);
            const isShared = viewMode === 'family';

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                sortBy,
                sortOrder,
                type: filterType,
                isShared: isShared.toString(),
                ...(filterCategory && { category: filterCategory }),
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
                ...(minAmount && { minAmount }),
                ...(maxAmount && { maxAmount }),
            });

            const [txRes, sumRes] = await Promise.all([
                api.get(`/api/finance?${queryParams.toString()}`),
                api.get(`/api/finance/summary?isShared=${isShared}`),
            ]);

            setTransactions(txRes.data.data);
            setMeta(txRes.data.meta);
            setSummary(sumRes.data);
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(
                Array.isArray(msg)
                    ? msg[0]
                    : msg || 'Не вдалося завантажити дані. Перевірте, чи ви перебуваєте в родині.'
            );
        } finally {
            setLoading(false);
        }
    }, [page, sortBy, sortOrder, filterType, filterCategory, dateFrom, dateTo, minAmount, maxAmount, viewMode]);

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
        if (!editingId) {
            payload.append('isShared', (viewMode === 'family').toString());
        }
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

            setPage(1);
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Не вдалося зберегти транзакцію.');
        }
    };

    const startEdit = (tx: Transaction) => {
        setEditingId(tx._id);
        setFormData({
            title: tx.title,
            amount: tx.amount.toString(),
            type: tx.type,
            category: tx.category,
        });
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
        if (!window.confirm('Видалити цей запис?')) return;
        try {
            setErrorMsg(null);
            await api.delete(`/api/finance/${id}`);
            if (editingId === id) cancelEdit();
            if (transactions.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                fetchData();
            }
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Не вдалося видалити транзакцію.');
        }
    };

    const handleFilterChange = () => setPage(1);

    const resetRangeFilters = () => {
        setDateFrom('');
        setDateTo('');
        setMinAmount('');
        setMaxAmount('');
        setPage(1);
    };

    if (loading && page === 1 && transactions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                Завантаження...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">Фінанси</h1>

                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                        <button
                            onClick={() => {
                                setViewMode('personal');
                                setPage(1);
                            }}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                viewMode === 'personal'
                                    ? 'bg-white shadow text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            👤 Особисті
                        </button>
                        <button
                            onClick={() => {
                                setViewMode('family');
                                setPage(1);
                            }}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                viewMode === 'family'
                                    ? 'bg-white shadow text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            👨‍👩‍👧 Спільні
                        </button>
                    </div>

                    <Link href="/">
                        <Button variant="secondary">На головну</Button>
                    </Link>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium shadow-sm">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <FinanceSummary summary={summary} viewMode={viewMode} />

                <div
                    className={`bg-white p-6 rounded-xl shadow-md border ${
                        editingId ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-100'
                    }`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            {editingId
                                ? '✏️ Редагування'
                                : viewMode === 'family'
                                    ? '➕ Нова спільна транзакція'
                                    : '➕ Нова особиста транзакція'}
                        </h2>
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-sm text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                            >
                                Скасувати
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <Input
                                    label="Назва"
                                    required
                                    placeholder="Кава..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    label="Сума (₴)"
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="1000"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="w-32">
                                <Input
                                    label="Категорія"
                                    required
                                    placeholder="Авто, Дім..."
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div className="w-32 flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Тип</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 transition-all"
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value as 'income' | 'expense',
                                        })
                                    }
                                >
                                    <option value="expense">Витрата</option>
                                    <option value="income">Дохід</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 gap-4">
                            <div className="w-full sm:w-auto">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Фото чека (необов&apos;язково)
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant={editingId ? 'danger' : 'primary'}
                                className={editingId ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                            >
                                {editingId ? 'Зберегти' : 'Додати транзакцію'}
                            </Button>
                        </div>
                    </form>
                </div>

                <FinanceFilters
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    handleFilterChange={handleFilterChange}
                />

                {/* Фільтри за діапазоном дат та сумою */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Дата від</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setPage(1);
                            }}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Дата до</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setPage(1);
                            }}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Сума від (₴)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={minAmount}
                            onChange={(e) => {
                                setMinAmount(e.target.value);
                                setPage(1);
                            }}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Сума до (₴)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="∞"
                            value={maxAmount}
                            onChange={(e) => {
                                setMaxAmount(e.target.value);
                                setPage(1);
                            }}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {(dateFrom || dateTo || minAmount || maxAmount) && (
                        <button
                            type="button"
                            onClick={resetRangeFilters}
                            className="px-3 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                        >
                            Скинути
                        </button>
                    )}
                </div>

                <TransactionList
                    transactions={transactions}
                    editingId={editingId}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                />

                {meta.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <Button
                            variant="secondary"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            ← Назад
                        </Button>
                        <span className="text-sm font-medium text-gray-600">
                            Сторінка {meta.page} з {meta.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={page === meta.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Далі →
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}