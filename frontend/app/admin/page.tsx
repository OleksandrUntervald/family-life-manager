'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';
import AdminUsersTable from '@/components/admin/AdminUsersTable';
import AdminAnalyticsTab from '@/components/admin/AdminAnalyticsTab';

function AdminContent() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activationToken, setActivationToken] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [meRes, usersRes, statsRes] = await Promise.all([
                api.get('/api/users/me'),
                api.get('/api/users/admin/all'),
                api.get('/api/users/admin/stats'),
            ]);
            setCurrentUserId(meRes.data?._id || meRes.data?.id || '');
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setErrorMsg(null);
        try {
            await api.patch(`/api/users/admin/${userId}/role`, { role: newRole });
            await loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Не вдалося змінити роль');
        }
    };

    const handleToggleBan = async (userId: string) => {
        setErrorMsg(null);
        try {
            await api.patch(`/api/users/admin/${userId}/ban`);
            await loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Не вдалося змінити статус блокування');
        }
    };

    const generateToken = async () => {
        setErrorMsg(null);
        try {
            const res = await api.post('/api/users/admin/generate-key');
            setActivationToken(res.data.token);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Лише ADMIN може генерувати ключі');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                Завантаження Адмін-панелі...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
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

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            activeTab === 'users'
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        👥 Користувачі (God Mode)
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            activeTab === 'analytics'
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        📈 Загальна Аналітика
                    </button>
                </div>

                {activeTab === 'analytics' ? (
                    <AdminAnalyticsTab
                        stats={stats}
                        activationToken={activationToken}
                        onGenerateToken={generateToken}
                    />
                ) : (
                    <AdminUsersTable
                        users={users}
                        currentUserId={currentUserId}
                        onRoleChange={handleRoleChange}
                        onToggleBan={handleToggleBan}
                    />
                )}
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    Завантаження CRM...
                </div>
            }
        >
            <AdminContent />
        </Suspense>
    );
}