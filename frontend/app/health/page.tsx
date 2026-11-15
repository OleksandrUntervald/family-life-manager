'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';
import BodySettingsForm from '@/components/health/BodySettingsForm';
import HealthMetricsCards from '@/components/health/HealthMetricsCards';

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

    const [selectedDate, setSelectedDate] = useState('');
    const [data, setData] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        consumedCalories: '',
        steps: '',
        weight: '',
        water: '',
    });

    const [userParams, setUserParams] = useState({
        height: 170,
        age: 30,
        gender: 'male',
        targetWeight: 70,
    });

    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    }, []);

    const fetchStats = async (date: string) => {
        if (!date) return;
        try {
            setLoading(true);
            const res = await api.get(`/api/health/stats/${date}`);
            setData(res.data);
            setFormData({
                consumedCalories: res.data.record?.consumedCalories
                    ? String(res.data.record.consumedCalories)
                    : '',
                steps: res.data.record?.steps ? String(res.data.record.steps) : '',
                weight: res.data.record?.weight ? String(res.data.record.weight) : '',
                water: res.data.record?.water ? String(res.data.record.water) : '',
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
        if (selectedDate) fetchStats(selectedDate);
    }, [selectedDate]);

    const handleDailySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const safeWeight =
                formData.weight === ''
                    ? data?.record?.weight || data?.stats?.currentWeight || 0
                    : Number(formData.weight);

            await api.post('/api/health', {
                date: selectedDate,
                consumedCalories:
                    formData.consumedCalories === ''
                        ? data?.record?.consumedCalories || 0
                        : Number(formData.consumedCalories),
                steps: formData.steps === '' ? data?.record?.steps || 0 : Number(formData.steps),
                weight: safeWeight,
                water: formData.water === '' ? data?.record?.water || 0 : Number(formData.water),
            });
            fetchStats(selectedDate);
        } catch (error) {
            console.error('Помилка збереження', error);
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch('/api/users/settings', {
                height: Number(userParams.height),
                age: Number(userParams.age),
                gender: userParams.gender,
                targetWeight: Number(userParams.targetWeight),
            });
            setShowSettings(false);
            fetchStats(selectedDate);
        } catch (error) {
            console.error('Помилка збереження налаштувань', error);
        }
    };

    const addWater = async (amount: number) => {
        const currentWater = Number(formData.water || 0);
        const newWater = Math.max(0, currentWater + amount);
        setFormData((prev) => ({ ...prev, water: String(newWater) }));

        try {
            const safeWeight =
                formData.weight === ''
                    ? data?.record?.weight || data?.stats?.currentWeight || 0
                    : Number(formData.weight);

            await api.post('/api/health', {
                date: selectedDate,
                consumedCalories:
                    formData.consumedCalories === ''
                        ? data?.record?.consumedCalories || 0
                        : Number(formData.consumedCalories),
                steps: formData.steps === '' ? data?.record?.steps || 0 : Number(formData.steps),
                weight: safeWeight,
                water: newWater,
            });
            fetchStats(selectedDate);
        } catch (error) {
            console.error('Помилка оновлення води', error);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                Завантаження...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 md:p-10 text-gray-800">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
                            🍏 Розумний Фітнес-Асистент
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Формула Міффліна-Сан Жеора у реальному часі
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all font-medium text-sm shadow-sm cursor-pointer"
                        >
                            ⚙️ Параметри тіла
                        </button>
                        <Link
                            href="/"
                            className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm"
                        >
                            Назад
                        </Link>
                    </div>
                </div>

                {showSettings && (
                    <BodySettingsForm
                        userParams={userParams}
                        setUserParams={setUserParams}
                        onSubmit={handleSettingsSubmit}
                    />
                )}

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            Обраний день
                        </label>
                        <input
                            type="date"
                            className="p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-gray-800 cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Базовий метаболізм (BMR)</p>
                        <p className="text-lg font-bold text-teal-700">{data?.stats?.bmr || 0} ккал / день</p>
                    </div>
                </div>

                <HealthMetricsCards
                    stats={data?.stats}
                    formData={formData}
                    onAddWater={addWater}
                />

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Внести показники за {selectedDate}
                    </h3>
                    <form onSubmit={handleDailySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Спожито калорій (ккал)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                                value={formData.consumedCalories}
                                onChange={(e) => setFormData({ ...formData, consumedCalories: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Пройдено кроків
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                                value={formData.steps}
                                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Поточна вага (кг)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Залишити поточну"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-gray-800"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm cursor-pointer"
                            >
                                Зберегти день
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}