'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/config/api';
import { DailyStats } from '@/types';
import BodySettingsForm from '@/components/health/BodySettingsForm';
import HealthMetricsCards from '@/components/health/HealthMetricsCards';

interface WeightHistoryItem {
    _id: string;
    date: string;
    weight: number;
    steps?: number;
    water?: number;
}

export default function HealthPage() {
    const [selectedDate, setSelectedDate] = useState('');
    const [data, setData] = useState<DailyStats | null>(null);
    const [weightHistory, setWeightHistory] = useState<WeightHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
            setErrorMsg(null);
            const [statsRes, historyRes] = await Promise.all([
                api.get(`/api/health/stats/${date}`),
                api.get<WeightHistoryItem[]>('/api/health'),
            ]);

            setData(statsRes.data);
            setFormData({
                consumedCalories: statsRes.data.record?.consumedCalories
                    ? String(statsRes.data.record.consumedCalories)
                    : '',
                steps: statsRes.data.record?.steps ? String(statsRes.data.record.steps) : '',
                weight: statsRes.data.record?.weight ? String(statsRes.data.record.weight) : '',
                water: statsRes.data.record?.water ? String(statsRes.data.record.water) : '',
            });
            if (statsRes.data.userParams) {
                setUserParams(statsRes.data.userParams);
            }

            if (Array.isArray(historyRes.data)) {
                const onlyWithWeight = historyRes.data.filter((item) => Number(item.weight) > 0);
                setWeightHistory(onlyWithWeight);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Не вдалося завантажити статистику');
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
            setErrorMsg(null);
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
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Помилка збереження показників');
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setErrorMsg(null);
            await api.patch('/api/users/settings', {
                height: Number(userParams.height),
                age: Number(userParams.age),
                gender: userParams.gender,
                targetWeight: Number(userParams.targetWeight),
            });
            setShowSettings(false);
            fetchStats(selectedDate);
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Помилка збереження налаштувань');
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

                {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
                        ⚠️ {errorMsg}
                    </div>
                )}

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
                        <p className="text-lg font-bold text-teal-700">
                            {data?.stats?.currentWeight ? `${data.stats.bmr} ккал / день` : 'Вкажіть вагу'}
                        </p>
                    </div>
                </div>

                <HealthMetricsCards stats={data?.stats} formData={formData} onAddWater={addWater} />

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
                                placeholder="Напр. 92.5"
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

                {/* Історія ваги */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">⚖️ Історія ваги</h3>
                        <span className="text-xs font-medium text-gray-400">
                            Ціль: {userParams.targetWeight} кг
                        </span>
                    </div>

                    {weightHistory.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            Записів ваги ще немає. Введіть свою вагу у формі вище, щоб почати відстеження.
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {weightHistory.slice(0, 15).map((item, idx) => {
                                const prev = weightHistory[idx + 1];
                                const diff = prev ? +(item.weight - prev.weight).toFixed(1) : null;
                                return (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => setSelectedDate(item.date)}
                                        className={`w-full py-3 px-2 flex items-center justify-between text-left hover:bg-teal-50/50 rounded-xl transition-colors cursor-pointer ${
                                            item.date === selectedDate ? 'bg-teal-50/80' : ''
                                        }`}
                                    >
                                        <span className="text-sm font-semibold text-gray-700">{item.date}</span>
                                        <div className="flex items-center gap-3">
                                            {diff !== null && diff !== 0 && (
                                                <span
                                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        diff < 0
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-rose-100 text-rose-700'
                                                    }`}
                                                >
                                                    {diff > 0 ? `+${diff}` : diff} кг
                                                </span>
                                            )}
                                            <span className="text-base font-extrabold text-teal-700">
                                                {item.weight} кг
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}