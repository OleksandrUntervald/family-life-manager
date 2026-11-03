'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // Стейт для родини
    const [family, setFamily] = useState<any>(null);
    const [newFamilyName, setNewFamilyName] = useState('');
    const [inviteCodeInput, setInviteCodeInput] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, familyRes] = await Promise.all([
                api.get('/api/users/me'),
                api.get('/api/families/my')
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
            showMessage('error', 'Ім\'я не може бути порожнім! ❌');
            return;
        }
        try {
            await api.patch('/api/users/profile', { name: profile.name.trim() });
            showMessage('success', 'Ім\'я профілю успішно оновлено! ✅');
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
                newPassword: passwords.newPassword
            });
            showMessage('success', 'Пароль успішно змінено! Перезайдіть у систему. 🔒');
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => handleLogout(), 2000);
        } catch (error: any) {
            showMessage('error', error.response?.data?.message || 'Невірний старий пароль або помилка сервера ❌');
        }
    };

    // --- ФУНКЦІЇ ДЛЯ РОДИНИ ---

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
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900 dark:to-slate-800">Завантаження профілю...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 md:p-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center bg-white/70 dark:bg-slate-800/80 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
                            👤 Налаштування профілю
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Керування обліковим записом, безпекою та родиною</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl font-medium text-sm shadow-sm transition-all ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                        {message.text}
                    </div>
                )}

                {/* --- СЕКЦІЯ РОДИНИ --- */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">👨‍👩‍👧 Спільний доступ (Родина)</h2>
                        <p className="text-sm text-indigo-700/70 dark:text-indigo-400 mt-1">Ведіть спільний бюджет та плануйте задачі разом</p>
                    </div>

                    {family ? (
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Назва родини</p>
                                    <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100">{family.name}</h3>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                                    <div>
                                        <p className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold">Код запрошення</p>
                                        <code className="text-lg font-mono font-bold text-indigo-700 dark:text-indigo-400">{family.inviteCode}</code>
                                    </div>
                                    <button onClick={copyInviteCode} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors" title="Скопіювати код">
                                        📋
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Учасники ({family.members?.length || 0})</p>
                                <div className="flex flex-wrap gap-3">
                                    {family.members?.map((member: any) => (
                                        <div key={member._id} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {member.name} {family.ownerId?._id === member._id && '👑'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                                <button onClick={handleLeaveFamily} className="text-sm font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                    Вийти з родини
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Створити нову родину</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Ви станете власником групи та отримаєте код для запрошення інших.</p>
                                <form onSubmit={handleCreateFamily} className="flex gap-2">
                                    <input
                                        type="text" required placeholder="Прізвище або назва..."
                                        className="flex-1 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 dark:text-gray-100"
                                        value={newFamilyName} onChange={(e) => setNewFamilyName(e.target.value)}
                                    />
                                    <button type="submit" className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm shadow-sm">
                                        Створити
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Приєднатися за кодом</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Введіть 8-значний код запрошення, щоб приєднатися до існуючої родини.</p>
                                <form onSubmit={handleJoinFamily} className="flex gap-2">
                                    <input
                                        type="text" required placeholder="XXXX-XXXX"
                                        className="flex-1 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono text-gray-800 dark:text-gray-100 uppercase"
                                        value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)}
                                    />
                                    <button type="submit" className="px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm shadow-sm">
                                        Вступити
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Особисті дані</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email (не змінюється)</label>
                                <input
                                    type="email" disabled
                                    className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-500 dark:text-gray-500 text-sm cursor-not-allowed"
                                    value={profile.email}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ім'я</label>
                                <input
                                    type="text" required
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm">
                                Зберегти ім'я
                            </button>
                        </form>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Безпека</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Поточний пароль</label>
                                <input
                                    type="password" required
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Новий пароль</label>
                                <input
                                    type="password" required minLength={6}
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Підтвердіть новий пароль</label>
                                <input
                                    type="password" required minLength={6}
                                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 text-gray-800 dark:text-gray-100 text-sm transition-all"
                                    value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-slate-700 to-gray-800 dark:from-slate-600 dark:to-slate-700 hover:from-slate-800 hover:to-gray-900 dark:hover:from-slate-500 dark:hover:to-slate-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm">
                                Змінити пароль
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-400">Вихід з акаунту</h3>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-1">Завершити сесію на цьому пристрої</p>
                    </div>
                    <button onClick={handleLogout} className="px-6 py-2.5 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white font-bold rounded-xl shadow-sm transition-all text-sm">
                        Вийти
                    </button>
                </div>

            </div>
        </div>
    );
}