'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Завантажуємо дані користувача з бекенду
                const res = await api.get('/api/auth/profile');
                setProfile({ name: res.data.name || '', email: res.data.email || '' });
            } catch (error) {
                console.error('Не вдалося завантажити профіль', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('/api/users/profile', { name: profile.name });
            showMessage('success', 'Ім\'я профілю успішно оновлено! ✅');
        } catch (error: any) {
            showMessage('error', 'Не вдалося оновити профіль ❌');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            showMessage('error', 'Нові паролі не співпадають! ❌');
            return;
        }
        try {
            await api.patch('/api/users/password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            showMessage('success', 'Пароль успішно змінено! 🔒');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Невірний старий пароль або помилка сервера ❌');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-50">Завантаження профілю...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 p-6 md:p-10 text-gray-800">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Шапка */}
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                            👤 Налаштування профілю
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Керування обліковим записом та безпекою</p>
                    </div>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm">
                        Назад
                    </Link>
                </div>

                {/* Блок повідомлень */}
                {message && (
                    <div className={`p-4 rounded-2xl font-medium text-sm shadow-sm transition-all ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Форма зміни імені */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Особисті дані</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email (не змінюється)</label>
                                <input
                                    type="email" disabled
                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 text-sm cursor-not-allowed"
                                    value={profile.email}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Ім'я</label>
                                <input
                                    type="text" required
                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 text-sm transition-all"
                                    value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl shadow-md transition-all text-sm">
                                Зберегти ім'я
                            </button>
                        </form>
                    </div>

                    {/* Форма зміни пароля */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Безпека</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Поточний пароль</label>
                                <input
                                    type="password" required
                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 text-sm transition-all"
                                    value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Новий пароль</label>
                                <input
                                    type="password" required minLength={6}
                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 text-sm transition-all"
                                    value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Підтвердіть новий пароль</label>
                                <input
                                    type="password" required minLength={6}
                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 text-sm transition-all"
                                    value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900 text-white font-bold rounded-2xl shadow-md transition-all text-sm">
                                Змінити пароль
                            </button>
                        </form>
                    </div>
                </div>

                {/* Небезпечна зона */}
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-red-800">Вихід з акаунту</h3>
                        <p className="text-xs text-red-600 mt-1">Завершити сесію на цьому пристрої</p>
                    </div>
                    <button onClick={handleLogout} className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 font-bold rounded-xl shadow-sm transition-all text-sm">
                        Вийти
                    </button>
                </div>

            </div>
        </div>
    );
}