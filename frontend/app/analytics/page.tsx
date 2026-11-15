'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/config/api';
import { CURRENCY_META, CurrencyCode } from '@/components/CurrencyWidget';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, ReferenceLine
} from 'recharts';

export default function AnalyticsPage() {
    const [healthData, setHealthData] = useState<any[]>([]);
    const [rawExpenses, setRawExpenses] = useState<any[]>([]);
    const [summaryStats, setSummaryStats] = useState({
        totalIncomeUAH: 0,
        totalExpenseUAH: 0,
        tasksTotal: 0,
        tasksCompleted: 0,
        workoutsCount: 0,
        targetWeight: 90,
    });
    const [currency, setCurrency] = useState<CurrencyCode>('UAH');
    const [rates, setRates] = useState<Record<CurrencyCode, number>>({
        UAH: 1,
        USD: 41.5,
        EUR: 45.2,
        PLN: 10.5,
        GBP: 52.8,
        CHF: 47.4,
        CZK: 1.78,
        CAD: 30.1,
        JPY: 0.27,
        TRY: 1.21,
        AUD: 27.2,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedCurr = localStorage.getItem('preferredCurrency') as CurrencyCode;
        if (savedCurr && CURRENCY_META[savedCurr]) setCurrency(savedCurr);

        const savedRates = localStorage.getItem('exchangeRatesToUAH');
        if (savedRates) {
            try {
                setRates((prev) => ({ ...prev, ...JSON.parse(savedRates) }));
            } catch (e) {}
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [healthRes, financeRes, tasksRes, workoutsRes, userRes] = await Promise.allSettled([
                    api.get('/api/health'),
                    api.get('/api/finance'),
                    api.get('/api/tasks'),
                    api.get('/api/workouts'),
                    api.get('/api/users/me'),
                ]);

                if (healthRes.status === 'fulfilled') {
                    const rawHealth = Array.isArray(healthRes.value.data) ? healthRes.value.data : [];
                    const sortedHealth = rawHealth.sort(
                        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                    setHealthData(sortedHealth);
                }

                let income = 0;
                let expense = 0;
                if (financeRes.status === 'fulfilled') {
                    const rawFinance = financeRes.value.data?.data || financeRes.value.data || [];
                    const txs = Array.isArray(rawFinance) ? rawFinance : [];
                    txs.forEach((t: any) => {
                        if (t.type === 'income') income += Number(t.amount) || 0;
                        if (t.type === 'expense') expense += Number(t.amount) || 0;
                    });
                    setRawExpenses(txs.filter((t: any) => t.type === 'expense'));
                }

                let tTotal = 0;
                let tDone = 0;
                if (tasksRes.status === 'fulfilled') {
                    const tasks = Array.isArray(tasksRes.value.data) ? tasksRes.value.data : [];
                    tTotal = tasks.length;
                    tDone = tasks.filter((t: any) => t.status === 'DONE' || t.completed).length;
                }

                const wCount =
                    workoutsRes.status === 'fulfilled' && Array.isArray(workoutsRes.value.data)
                        ? workoutsRes.value.data.length
                        : 0;
                const tWeight =
                    userRes.status === 'fulfilled' ? userRes.value.data?.targetWeight || 90 : 90;

                setSummaryStats({
                    totalIncomeUAH: income,
                    totalExpenseUAH: expense,
                    tasksTotal: tTotal,
                    tasksCompleted: tDone,
                    workoutsCount: wCount,
                    targetWeight: tWeight,
                });
            } catch (error) {
                console.error('Помилка завантаження аналітики:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const convertFromUAH = (valUAH: number) => {
        const rate = rates[currency] || 1;
        return +(valUAH / rate).toFixed(2);
    };

    const handleCurrencySwitch = (code: CurrencyCode) => {
        setCurrency(code);
        localStorage.setItem('preferredCurrency', code);
    };

    const financeChartData = (() => {
        const grouped = rawExpenses.reduce((acc: any, curr: any) => {
            const category = curr.category || 'Інше';
            if (!acc[category]) acc[category] = 0;
            acc[category] += Number(curr.amount) || 0;
            return acc;
        }, {});

        return Object.keys(grouped).map((key) => ({
            name: key,
            amount: convertFromUAH(grouped[key]),
        }));
    })();

    const sym = CURRENCY_META[currency].symbol;
    const latestWeight = healthData.length > 0 ? healthData[healthData.length - 1].weight : '—';
    const taskCompletionRate =
        summaryStats.tasksTotal > 0
            ? Math.round((summaryStats.tasksCompleted / summaryStats.tasksTotal) * 100)
            : 0;
    const netBalanceUAH = summaryStats.totalIncomeUAH - summaryStats.totalExpenseUAH;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900 dark:to-slate-800 text-indigo-500 font-semibold">
                Аналізуємо ваші показники...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 md:p-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                            📈 Візуальна Аналітика
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Зведена статистика фінансів, тренувань, завдань та ваги
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-300">Валюта:</span>
                            <select
                                value={currency}
                                onChange={(e) => handleCurrencySwitch(e.target.value as CurrencyCode)}
                                className="bg-transparent text-xs font-bold text-violet-600 dark:text-violet-300 outline-none cursor-pointer"
                            >
                                {(Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => (
                                    <option
                                        key={code}
                                        value={code}
                                        className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
                                    >
                                        {CURRENCY_META[code].flag} {code} ({CURRENCY_META[code].symbol}) — {CURRENCY_META[code].label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Link
                            href="/"
                            className="px-5 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-all shadow-sm font-medium text-sm"
                        >
                            ← На головну
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm">
                        <p className="text-xs font-bold uppercase text-gray-400">Чистий баланс</p>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            {convertFromUAH(netBalanceUAH)} {sym}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Витрачено: {convertFromUAH(summaryStats.totalExpenseUAH)} {sym}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm">
                        <p className="text-xs font-bold uppercase text-gray-400">Поточна вага</p>
                        <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                            {latestWeight} кг
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Цільова вага: {summaryStats.targetWeight} кг
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm">
                        <p className="text-xs font-bold uppercase text-gray-400">Виконання завдань</p>
                        <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                            {taskCompletionRate}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Закрито {summaryStats.tasksCompleted} із {summaryStats.tasksTotal}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm">
                        <p className="text-xs font-bold uppercase text-gray-400">Усього тренувань</p>
                        <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                            {summaryStats.workoutsCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Зафіксовано у базі</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">
                            Динаміка ваги (ціль: {summaryStats.targetWeight} кг)
                        </h3>
                        <div className="h-72 w-full">
                            {healthData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
                                                color: '#1f2937',
                                            }}
                                        />
                                        <ReferenceLine
                                            y={summaryStats.targetWeight}
                                            label="Ціль"
                                            stroke="#10b981"
                                            strokeDasharray="4 4"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            name="Вага (кг)"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#8b5cf6' }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Додайте записи у розділі «Активність», щоб побачити графік
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">
                            Витрати за категоріями ({currency}, {sym})
                        </h3>
                        <div className="h-72 w-full">
                            {financeChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financeChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
                                                color: '#1f2937',
                                            }}
                                        />
                                        <Bar dataKey="amount" name={`Сума (${sym})`} fill="#10b981" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    Додайте витрати у розділі «Фінанси», щоб побачити розподіл
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}