'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

interface DailyStats {
    record: {
        date: string;
        consumedCalories: number;
        steps: number;
        weight: number;
        water: number;
    };
    userParams: {
        height: number;
        age: number;
        gender: string;
        targetWeight: number;
    };
    stats: {
        currentWeight: number;
        bmr: number;
        burnedFromSteps: number;
        dynamicCalorieGoal: number;
        caloriesLeft: number;
        water: number;
    };
}

export default function HealthPage() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Форма для щоденних показників
    const [formData, setFormData] = useState({
        consumedCalories: '',
        steps: '',
        weight: '',
        water: ''
    });

    // Форма для параметрів профілю
    const [userParams, setUserParams] = useState({
        height: 170,
        age: 30,
        gender: 'male',
        targetWeight: 70
    });

    const [showSettings, setShowSettings] = useState(false);

    const fetchStats = async (date: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/health/stats/${date}`);
            setData(res.data);
            setFormData({
                consumedCalories: res.data.record.consumedCalories ? String(res.data.record.consumedCalories) : '',
                steps: res.data.record.steps ? String(res.data.record.steps) : '',
                weight: res.data.record.weight ? String(res.data.record.weight) : '',
                water: res.data.record.water ? String(res.data.record.water) : ''
            });
            if (res.data.userParams) {
                setUserParams(res.data.userParams);
            }
        } catch (error) {
            console.error('Помилка завантаження статистики', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(selectedDate);
    }, [selectedDate]);

    // Збереження щоденних показників (калорії, кроки, вага, вода)
    const handleDailySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/health', {
                date: selectedDate,
                consumedCalories: formData.consumedCalories ? Number(formData.consumedCalories) : 0,
                steps: formData.steps ? Number(formData.steps) : 0,
                weight: formData.weight ? Number(formData.weight) : 0,
                water: formData.water ? Number(formData.water) : 0,
            });
            fetchStats(selectedDate);
        } catch (error) {
            console.error('Помилка збереження', error);
        }
    };

    // Збереження налаштувань профілю (зріст, вік тощо)
    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('/api/users/settings', {
                height: Number(userParams.height),
                age: Number(userParams.age),
                gender: userParams.gender,
                targetWeight: Number(userParams.targetWeight)
            });
            setShowSettings(false);
            fetchStats(selectedDate);
        } catch (error) {
            console.error('Помилка збереження налаштувань', error);
        }
    };

    // Швидке додавання води (+250 мл)
    const addWater = async (amount: number) => {
        const currentWater = Number(formData.water || 0);
        const newWater = Math.max(0, currentWater + amount);
        setFormData(prev => ({ ...prev, water: String(newWater) }));

        try {
            await api.post('/api/health', {
                date: selectedDate,
                consumedCalories: formData.consumedCalories ? Number(formData.consumedCalories) : 0,
                steps: formData.steps ? Number(formData.steps) : 0,
                weight: formData.weight ? Number(formData.weight) : 0,
                water: newWater,
            });
            fetchStats(selectedDate);
        } catch (error) {
            console.error('Помилка оновлення води', error);
        }
    };

    if (loading && !data) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">Завантаження...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 md:p-10 text-gray-800">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Шапка */}
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
                            🍏 Розумний Фітнес-Асистент
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Формула Міффліна-Сан Жеора у реальному часі</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all font-medium text-sm shadow-sm"
                        >
                            ⚙️ Параметри тіла
                        </button>
                        <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm">
                            Назад
                        </Link>
                    </div>
                </div>

                {/* Панель налаштувань тіла (випадаюча) */}
                {showSettings && (
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-md border border-teal-200 transition-all">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Твої антропометричні дані (для розрахунку норм)</h2>
                        <form onSubmit={handleSettingsSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Зріст (см)</label>
                                <input
                                    type="number" required className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                                    value={userParams.height} onChange={e => setUserParams({...userParams, height: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Вік (років)</label>
                                <input
                                    type="number" required className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                                    value={userParams.age} onChange={e => setUserParams({...userParams, age: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Стать</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                                    value={userParams.gender} onChange={e => setUserParams({...userParams, gender: e.target.value})}
                                >
                                    <option value="male">Чоловіча</option>
                                    <option value="female">Жіноча</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Цільова вага (кг)</label>
                                <input
                                    type="number" required className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                                    value={userParams.targetWeight} onChange={e => setUserParams({...userParams, targetWeight: Number(e.target.value)})}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-4 flex justify-end">
                                <button type="submit" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition-all text-sm">
                                    Зберегти параметри
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Вибір дати */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Обраний день</label>
                        <input
                            type="date"
                            className="p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-gray-800 cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Базовий метаболізм (BMR)</p>
                        <p className="text-lg font-bold text-teal-700">{data?.stats.bmr} ккал / день</p>
                    </div>
                </div>

                {/* РОЗУМНІ ВІДЖЕТИ СТАТИСТИКИ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Калорії */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">🔥 Калорії (Баланс)</span>
                            <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">Ціль: {data?.stats.dynamicCalorieGoal}</span>
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {data?.stats.caloriesLeft} <span className="text-sm font-normal text-gray-400">залишилось</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                З'їдено: <span className="font-bold text-gray-700">{formData.consumedCalories || 0}</span> | Спалено кроками: <span className="font-bold text-teal-600">+{data?.stats.burnedFromSteps}</span>
                            </p>
                        </div>
                    </div>

                    {/* Кроки */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">👟 Кроки</span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Ціль: 10 000</span>
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-gray-800">
                                {formData.steps || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Енергія від ходьби: <span className="font-bold text-teal-600">~{data?.stats.burnedFromSteps} ккал</span>
                            </p>
                        </div>
                    </div>

                    {/* Вода */}
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">💧 Гідратація</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">Ціль: 2500 мл</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-3xl font-extrabold text-gray-800">
                                    {formData.water || 0} <span className="text-sm font-normal text-gray-400">мл</span>
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                <button type="button" onClick={() => addWater(250)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow">
                                    +250
                                </button>
                                <button type="button" onClick={() => addWater(-250)} className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-xs">
                                    -
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Форма введення даних за день */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Внести показники за {selectedDate}</h3>
                    <form onSubmit={handleDailySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Спожито калорій (ккал)</label>
                            <input
                                type="number" min="0" placeholder="Наприклад: 2400"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                                value={formData.consumedCalories} onChange={(e) => setFormData({ ...formData, consumedCalories: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Пройдено кроків</label>
                            <input
                                type="number" min="0" placeholder="Наприклад: 8500"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                                value={formData.steps} onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Поточна вага (кг)</label>
                            <input
                                type="number" min="0" step="0.1" placeholder="Наприклад: 94.5"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                                value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm">
                                Зберегти день
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}