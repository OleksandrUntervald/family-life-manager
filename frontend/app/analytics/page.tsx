'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

export default function AnalyticsPage() {
    const router = useRouter();
    const [healthData, setHealthData] = useState<any[]>([]);
    const [financeData, setFinanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Завантажуємо історію здоров'я та фінансів
                const [healthRes, financeRes] = await Promise.all([
                    api.get('/api/health'), // Припускаємо, що цей ендпоінт повертає масив записів Health
                    api.get('/api/finance')
                ]);

                // Сортуємо здоров'я по даті за зростанням для графіка
                const sortedHealth = (healthRes.data || []).sort((a: any, b: any) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setHealthData(sortedHealth);

                // Групуємо фінанси по категоріях для графіка
                const expenses = (financeRes.data || []).filter((t: any) => t.type === 'expense');
                const groupedFinance = expenses.reduce((acc: any, curr: any) => {
                    const category = curr.category || 'Інше';
                    if (!acc[category]) acc[category] = 0;
                    acc[category] += curr.amount;
                    return acc;
                }, {});

                const financeChartData = Object.keys(groupedFinance).map(key => ({
                    name: key,
                    amount: groupedFinance[key]
                }));
                setFinanceData(financeChartData);

            } catch (error) {
                console.error('Помилка завантаження аналітики', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-50">Аналізуємо дані...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 p-6 md:p-10 text-gray-800">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Шапка */}
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                            📈 Візуальна Аналітика
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Твій прогрес на шляху до цілей</p>
                    </div>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm">
                        Назад
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Графік Ваги */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Динаміка Ваги (ціль 90 кг)</h3>
                        <div className="h-72 w-full">
                            {healthData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{fontSize: 12}} stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="weight" name="Вага (кг)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Немає даних для графіка</div>
                            )}
                        </div>
                    </div>

                    {/* Графік Витрат */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Витрати за категоріями</h3>
                        <div className="h-72 w-full">
                            {financeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" />
                                        <YAxis tick={{fontSize: 12}} stroke="#9ca3af" />
                                        <Tooltip
                                            cursor={{fill: '#f3f4f6'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="amount" name="Сума (₴)" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Немає даних для графіка</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}