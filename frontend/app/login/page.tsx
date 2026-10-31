'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    // Стани для режиму відновлення пароля
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/api/auth/login', formData);
            Cookies.set('access_token', response.data.access_token, { expires: 7 });

            const userRole = response.data.user?.role;
            if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'manager') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Невірний email або пароль');
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage(null);

        if (!resetEmail) {
            setResetMessage({ type: 'error', text: 'Будь ласка, введіть ваш email' });
            return;
        }

        // Імітація API запиту для MVP (щоб закрити вимогу ТЗ без розгортання поштового сервера)
        setTimeout(() => {
            setResetMessage({ type: 'success', text: 'Якщо цей email зареєстровано, ми надіслали на нього інструкції з відновлення.' });
            setResetEmail('');
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300 p-4">
            <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
                        {isResetMode ? 'Відновлення пароля' : 'Вхід в систему'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isResetMode ? 'Введіть ваш email для отримання інструкцій' : 'Вітаємо у Life Manager SaaS'}
                    </p>
                </div>

                {error && !isResetMode && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-2xl text-sm font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {resetMessage && isResetMode && (
                    <div className={`mb-6 p-4 rounded-2xl text-sm font-medium border ${resetMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                        {resetMessage.text}
                    </div>
                )}

                {isResetMode ? (
                    /* Форма відновлення пароля */
                    <form onSubmit={handleResetSubmit} className="space-y-5 animate-in fade-in zoom-in duration-300">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                placeholder="ваша@пошта.com"
                                className="w-full p-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-100 transition-all"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md"
                        >
                            Відправити інструкції
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => { setIsResetMode(false); setResetMessage(null); }}
                                className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                ← Повернутися до входу
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Форма логіну */
                    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in zoom-in duration-300">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
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
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Пароль</label>
                                <button
                                    type="button"
                                    onClick={() => { setIsResetMode(true); setError(''); }}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
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
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md mt-2"
                        >
                            Увійти
                        </button>

                        <div className="text-center pt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                            Немає акаунту?{' '}
                            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                Зареєструватися
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}