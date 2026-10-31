'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

function AdminContent() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Стан для токена активації
    const [activationToken, setActivationToken] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users/admin/all');
            setUsers(res.data);
        } catch (error) {
            router.push('/');
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/users/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchStats()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        await api.patch(`/api/users/admin/${userId}/role`, { role: newRole });
        loadData();
    };

    const handleToggleBan = async (userId: string) => {
        await api.patch(`/api/users/admin/${userId}/ban`);
        loadData();
    };

    const generateToken = () => {
        // Генерація випадкового 16-значного ключа формату XXXX-XXXX-XXXX-XXXX
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let token = "";
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) token += "-";
            token += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setActivationToken(token);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Завантаження Адмін-панелі...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">

                {/* Шапка Адмін-панелі */}
                <header className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-extrabold text-slate-800">🛡️ Admin Panel</h1>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                            Всього юзерів: {stats?.totalUsers || 0}
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                    >
                        ← На Дашборд
                    </Link>
                </header>

                {/* Перемикач вкладок */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'users' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        👥 Користувачі (God Mode)
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'analytics' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        📈 Загальна Аналітика
                    </button>
                </div>

                {activeTab === 'analytics' ? (
                    <div className="space-y-6">
                        {/* Картки статистики */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                                <span className="text-4xl mb-2">👥</span>
                                <h3 className="text-gray-500 font-medium text-sm">Всього акаунтів</h3>
                                <p className="text-3xl font-extrabold text-slate-800">{stats?.totalUsers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                                <span className="text-4xl mb-2">✅</span>
                                <h3 className="text-gray-500 font-medium text-sm">Активних</h3>
                                <p className="text-3xl font-extrabold text-green-600">{stats?.activeUsers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                                <span className="text-4xl mb-2">👑</span>
                                <h3 className="text-gray-500 font-medium text-sm">Premium-користувачів</h3>
                                <p className="text-3xl font-extrabold text-amber-500">{stats?.premiumUsers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                                <span className="text-4xl mb-2">🚫</span>
                                <h3 className="text-gray-500 font-medium text-sm">Заблокованих</h3>
                                <p className="text-3xl font-extrabold text-red-500">{stats?.bannedUsers}</p>
                            </div>
                        </div>

                        {/* Генерація токенів */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">🔑 Генерація токенів активації</h2>
                            <p className="text-sm text-gray-500 mb-6">Створіть унікальний ключ для видачі Premium доступу користувачам.</p>

                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={generateToken}
                                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm"
                                >
                                    Згенерувати ключ
                                </button>

                                {activationToken && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex-1">
                                        <code className="text-lg font-mono font-bold text-slate-700 tracking-wider flex-1 text-center">
                                            {activationToken}
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(activationToken)}
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100"
                                            title="Скопіювати"
                                        >
                                            📋
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                            className="px-3 py-1.5 border rounded-xl font-semibold text-xs bg-white cursor-pointer outline-none"
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
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                                                u.isBanned ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Завантаження CRM...</div>}>
            <AdminContent />
        </Suspense>
    );
}