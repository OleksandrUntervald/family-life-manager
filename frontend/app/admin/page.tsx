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
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) token += '-';
            token += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setActivationToken(token);
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