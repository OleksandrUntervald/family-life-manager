'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

function AdminContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Читаємо поточну сторінку з queryParams (?page=...) - вимога ТЗ диплому
    const currentPage = Number(searchParams.get('page')) || 1;

    const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
    const [requests, setRequests] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (page: number, status = statusFilter, searchQuery = search) => {
        setLoading(true);
        try {
            const res = await api.get('/api/premium-requests', {
                params: { page, limit: 25, status, search: searchQuery },
            });
            setRequests(res.data.data);
            setTotalPages(res.data.totalPages || 1);
            setTotalCount(res.data.total);
        } catch (error) {
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users/admin/all');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
        fetchUsers();
    }, [currentPage, statusFilter]);

    // Зміна сторінки із записом у queryParams (?page=X)
    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        router.push(`/admin?page=${page}`);
    };

    const handleSeedDump = async () => {
        await api.post('/api/premium-requests/seed');
        fetchOrders(1);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await api.patch(`/api/premium-requests/${id}`, { status: newStatus });
        fetchOrders(currentPage);
        fetchUsers();
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        await api.patch(`/api/users/admin/${userId}/role`, { role: newRole });
        fetchUsers();
    };

    const handleToggleBan = async (userId: string) => {
        await api.patch(`/api/users/admin/${userId}/ban`);
        fetchUsers();
    };

    // Алгоритм пагінатора на 4 візуальні режими з крапками (...) за вимогами диплому
    const getPaginationItems = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 8) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 4) {
            // Режим А та Б: перша половина діапазону
            pages.push(1, 2, 3, 4, 5, 6, 7, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            // Режим Г: в кінці діапазону
            pages.push(1, '...', totalPages - 6, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            // Режим В: всередині діапазону
            pages.push(1, '...', currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, '...', totalPages);
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">

                {/* Шапка Адмін-панелі */}
                <header className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-extrabold text-slate-800">🛡️ CRM & Admin Panel</h1>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              Всього заявок: {totalCount}
            </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSeedDump}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                        >
                            ⚡ Згенерувати дамп (105 заявок)
                        </button>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
                        >
                            ← На Дашборд
                        </Link>
                    </div>
                </header>

                {/* Перемикач вкладок */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        📋 Заявки на Преміум (Orders)
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'users' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        👥 Користувачі (God Mode)
                    </button>
                </div>

                {activeTab === 'orders' ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                        {/* Панель фільтрів */}
                        <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Пошук за ім'ям, email, telegram..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="px-3 py-2 border rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    onClick={() => fetchOrders(1, statusFilter, search)}
                                    className="px-4 py-2 bg-slate-800 text-white text-sm rounded-xl font-semibold hover:bg-slate-700"
                                >
                                    Знайти
                                </button>
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border rounded-xl text-sm bg-white outline-none"
                            >
                                <option value="all">Усі статуси</option>
                                <option value="New">New (Нові)</option>
                                <option value="In work">In work (В роботі)</option>
                                <option value="Agree">Agree (Підключено Premium)</option>
                                <option value="Disagree">Disagree (Відмова)</option>
                                <option value="Dubbing">Dubbing (Дубль)</option>
                            </select>
                        </div>

                        {/* Таблиця Заявок (Orders) */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                <tr className="bg-emerald-600 text-white uppercase">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Telegram</th>
                                    <th className="p-3">Plan (Course)</th>
                                    <th className="p-3">Format</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Sum</th>
                                    <th className="p-3">Paid</th>
                                    <th className="p-3">Manager</th>
                                    <th className="p-3">Created At</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="text-center p-8 text-gray-400">Завантаження заявок...</td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="text-center p-8 text-gray-500">
                                            Заявок поки немає. Натисніть <b>«⚡ Згенерувати дамп (105 заявок)»</b> зверху!
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req, idx) => (
                                        <tr key={req._id} className="hover:bg-emerald-50/40 transition-colors">
                                            <td className="p-3 font-mono text-gray-500">#{(currentPage - 1) * 25 + idx + 1}</td>
                                            <td className="p-3 font-semibold">{req.name}</td>
                                            <td className="p-3 text-gray-600">{req.email}</td>
                                            <td className="p-3 font-bold text-indigo-600">{req.telegram}</td>
                                            <td className="p-3">{req.plan}</td>
                                            <td className="p-3">{req.billingFormat}</td>
                                            <td className="p-3">
                                                <select
                                                    value={req.status}
                                                    onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg font-bold text-xs border outline-none ${
                                                        req.status === 'Agree'
                                                            ? 'bg-green-100 text-green-800 border-green-300'
                                                            : req.status === 'New'
                                                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                                : req.status === 'Disagree'
                                                                    ? 'bg-red-100 text-red-800 border-red-300'
                                                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                                    }`}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="In work">In work</option>
                                                    <option value="Agree">Agree (Видати PRO)</option>
                                                    <option value="Disagree">Disagree</option>
                                                    <option value="Dubbing">Dubbing</option>
                                                </select>
                                            </td>
                                            <td className="p-3 font-semibold">${req.sum}</td>
                                            <td className="p-3 text-gray-600">${req.alreadyPaid}</td>
                                            <td className="p-3 text-gray-500">{req.manager || '—'}</td>
                                            <td className="p-3 text-gray-400">{new Date(req.createdAt).toLocaleDateString('uk-UA')}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Пагінатор у стилі ТЗ (зелений круговий дизайн з 4 станами) */}
                        {totalPages > 1 && (
                            <div className="p-6 flex justify-center items-center gap-2 bg-white border-t">
                                {currentPage > 1 && (
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-sm"
                                    >
                                        &lt;
                                    </button>
                                )}

                                {getPaginationItems().map((item, index) =>
                                        item === '...' ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center opacity-80"
                                            >
                      ...
                    </span>
                                        ) : (
                                            <button
                                                key={item}
                                                onClick={() => goToPage(Number(item))}
                                                className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-all shadow-sm ${
                                                    currentPage === item
                                                        ? 'bg-emerald-800 text-white scale-110 ring-2 ring-emerald-300'
                                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        )
                                )}

                                {currentPage < totalPages && (
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center shadow-sm"
                                    >
                                        &gt;
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Вкладка керування користувачами (God Mode) */
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="p-4">Ім'я</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Поточна Роль</th>
                                <th className="p-4">Статус</th>
                                <th className="p-4">Дії (God Mode)</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold">{u.name}</td>
                                    <td className="p-4 text-gray-600">{u.email}</td>
                                    <td className="p-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            className="px-3 py-1.5 border rounded-xl font-semibold text-xs bg-white"
                                        >
                                            <option value="user">USER (Звичайний)</option>
                                            <option value="premium">👑 PREMIUM</option>
                                            <option value="manager">🛠️ MANAGER</option>
                                            <option value="admin">🛡️ ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        {u.isBanned ? (
                                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Заблокований</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Активний</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleBan(u._id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white ${
                                                u.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        >
                                            {u.isBanned ? 'Розблокувати' : 'Заблокувати'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Завантаження CRM...</div>}>
            <AdminContent />
        </Suspense>
    );
}