'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/api/auth/register', { name, email, password });
            if (res.data?.access_token) {
                Cookies.set('access_token', res.data.access_token, { expires: 7 });
                localStorage.setItem('token', res.data.access_token);
                router.push('/');
            } else {
                router.push('/login');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(Array.isArray(msg) ? msg[0] : msg || 'Помилка реєстрації. Перевірте введені дані.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Створити акаунт</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Приєднуйтесь до Life Manager SaaS</p>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm rounded-xl font-medium">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ім&apos;я</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше ім'я"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Мінімум 6 символів"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
                    >
                        {loading ? ' Створення...' : 'Зареєструватися'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-700 text-center text-sm text-gray-600 dark:text-gray-400">
                    Вже маєте акаунт?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Увійти в систему
                    </Link>
                </div>
            </div>
        </div>
    );
}