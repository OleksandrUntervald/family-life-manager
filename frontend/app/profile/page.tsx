'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';
import FamilySection from '@/components/profile/FamilySection';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [family, setFamily] = useState<any>(null);
    const [newFamilyName, setNewFamilyName] = useState('');
    const [inviteCodeInput, setInviteCodeInput] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, familyRes] = await Promise.all([
                api.get('/api/users/me'),
                api.get('/api/families/my'),
            ]);

            setProfile({ name: userRes.data.name || '', email: userRes.data.email || '' });
            setFamily(familyRes.data);
        } catch (error) {
            console.error('Не вдалося завантажити дані', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.name.trim()) {
            showMessage('error', "Ім'я не може бути порожнім! ❌");
            return;
        }
        try {
            await api.patch('/api/users/profile', { name: profile.name.trim() });
            showMessage('success', "Ім'я профілю успішно оновлено! ✅");
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Не вдалося оновити профіль ❌');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            showMessage('error', 'Нові паролі не співпадають! ❌');
            return;
        }
        if (passwords.newPassword.length < 6) {
            showMessage('error', 'Новий пароль має бути не коротшим за 6 символів! ❌');
            return;
        }
        try {
            await api.patch('/api/users/password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword,
            });
            showMessage('success', 'Пароль успішно змінено! Перезайдіть у систему. 🔒');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => handleLogout(), 2000);
        } catch (error: any) {
            showMessage(
                'error',
                error.response?.data?.message || 'Невірний старий пароль або помилка сервера ❌'
            );
        }
    };

    const handleCreateFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFamilyName.trim()) return;
        try {
            await api.post('/api/families/create', { name: newFamilyName.trim() });
            setNewFamilyName('');
            showMessage('success', 'Родину успішно створено! ✅');
            fetchData();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Помилка при створенні родини ❌');
        }
    };

    const handleJoinFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCodeInput.trim()) return;
        try {
            await api.post('/api/families/join', { inviteCode: inviteCodeInput.trim() });
            setInviteCodeInput('');
            showMessage('success', 'Ви успішно приєдналися до родини! ✅');
            fetchData();
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Невірний код або помилка сервера ❌');
        }
    };

    const handleLeaveFamily = async () => {
        if (!window.confirm('Ви впевнені, що хочете покинути цю родину?')) return;
        try {
            await api.delete('/api/families/leave');
            showMessage('success', 'Ви покинули родину.');
            setFamily(null);
            fetchData();
        } catch (error: any) {
            showMessage('error', 'Помилка при виході з родини ❌');
        }
    };

    const copyInviteCode = () => {
        if (family?.inviteCode) {
            navigator.clipboard.writeText(family.inviteCode);
            showMessage('success', 'Код скопійовано в буфер обміну! 📋');
        }
    };

    const handleLogout = () => {
        Cookies.remove('access_token');
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900 dark:to-slate-800">
                Завантаження профілю...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 md:p-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white/70 dark:bg-slate-800/80 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
                            👤 Налаштування профілю
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Керування обліковим записом, безпекою та родиною
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="px-5 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm"
                    >
                        Назад
                    </Link>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-2xl font-medium text-sm shadow-sm transition-all ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <FamilySection
                    family={family}
                    newFamilyName={newFamilyName}
                    setNewFamilyName={setNewFamilyName}
                    inviteCodeInput={inviteCodeInput}
                    setInviteCodeInput={setInviteCodeInput}
                    onCreateFamily={handleCreateFamily}
                    onJoinFamily={handleJoinFamily}
                    onLeaveFamily={handleLeaveFamily}
                    onCopyInviteCode={copyInviteCode}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Особисті дані
                        </h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Email (не змінюється)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-500 text-sm cursor-not-allowed"
                                    value={profile.email}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Ім&apos;я
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 text-white font-bold rounded-2xl shadow-md transition-all text-sm cursor-pointer"
                            >
                                Зберегти ім&apos;я
                            </button>
                        </form>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Безпека</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Поточний пароль
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={passwords.oldPassword}
                                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Новий пароль
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Підтвердіть новий пароль
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900 text-white font-bold rounded-2xl shadow-md transition-all text-sm cursor-pointer"
                            >
                                Змінити пароль
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-400">Вихід з акаунту</h3>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                            Завершити сесію на цьому пристрої
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2.5 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white font-bold rounded-xl shadow-sm transition-all text-sm cursor-pointer"
                    >
                        Вийти
                    </button>
                </div>
            </div>
        </div>
    );
}