'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';
import { Role } from '@/types';

const ADMIN_ROLES: Role[] = ['admin', 'super_admin', 'manager'];

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Будь ласка, заповніть всі поля');
            return;
        }
        if (formData.password.length < 6) {
            setError('Пароль має містити щонайменше 6 символів');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/api/auth/login', formData);
            Cookies.set('access_token', response.data.access_token, { expires: 7 });
            localStorage.setItem('token', response.data.access_token);

            const userRole: Role = response.data.user?.role;

            if (ADMIN_ROLES.includes(userRole)) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : msg || 'Невірний email або пароль');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage(null);

        if (!resetEmail || !/^\S+@\S+\.\S+$/.test(resetEmail.trim())) {
            setResetMessage({ type: 'error', text: 'Будь ласка, введіть коректний email' });
            return;
        }
        if (!resetNewPassword || resetNewPassword.length < 6) {
            setResetMessage({
                type: 'error',
                text: 'Новий пароль має містити щонайменше 6 символів',
            });
            return;
        }

        try {
            setResetLoading(true);
            const res = await api.post('/api/auth/reset-password', {
                email: resetEmail.trim(),
                newPassword: resetNewPassword,
            });
            setResetMessage({
                type: 'success',
                text: res.data?.message || 'Пароль успішно оновлено! Тепер ви можете увійти.',
            });
            setResetEmail('');
            setResetNewPassword('');
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setResetMessage({
                type: 'error',
                text: Array.isArray(msg) ? msg[0] : msg || 'Не вдалося скинути пароль',
            });
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300 p-4">
            <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
                        {isResetMode ? 'Скидання пароля' : 'Вхід в систему'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isResetMode
                            ? 'Вкажіть ваш email та встановіть новий пароль'
                            : 'Вітаємо у Life Manager SaaS'}
                    </p>
                </div>

                {error && !isResetMode && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-2xl text-sm font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {resetMessage && isResetMode && (
                    <div
                        className={`mb-6 p-4 rounded-2xl text-sm font-medium border ${
                            resetMessage.type === 'success'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        }`}
                    >
                        {resetMessage.text}
                    </div>
                )}

                {isResetMode ? (
                    <form onSubmit={handleResetSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Ваш Email
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="ваша@пошта.com"
                                className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-100 transition-all"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Новий пароль (мін. 6 символів)
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-100 transition-all"
                                value={resetNewPassword}
                                onChange={(e) => setResetNewPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={resetLoading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md cursor-pointer disabled:opacity-70"
                        >
                            {resetLoading ? 'Оновлення...' : 'Встановити новий пароль'}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsResetMode(false);
                                    setResetMessage(null);
                                }}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            >
                                ← Повернутися до входу
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="ваша@пошта.com"
                                className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-100 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Пароль
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResetMode(true);
                                        setError('');
                                    }}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                    Забули пароль?
                                </button>
                            </div>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-100 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md mt-2 disabled:opacity-70 cursor-pointer"
                        >
                            {loading ? 'Завантаження...' : 'Увійти'}
                        </button>

                        <div className="text-center pt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Немає акаунту?{' '}
                            <Link
                                href="/register"
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                            >
                                Зареєструватися
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}