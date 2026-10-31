'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

interface Workout {
    _id: string;
    title: string;
    weight: number;
    reps: number;
    sets: number;
    date: string;
    createdAt: string;
}

export default function WorkoutsPage() {
    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Стейт для графіка прогресу
    const [selectedChartExercise, setSelectedChartExercise] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '', weight: '', reps: '', sets: '', date: ''
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const response = await api.get('/api/workouts');
            setWorkouts(response.data);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: formData.title.trim(),
            weight: Number(formData.weight),
            reps: Number(formData.reps),
            sets: Number(formData.sets),
            date: formData.date
        };

        try {
            if (editingId) {
                await api.patch(`/api/workouts/${editingId}`, payload);
                setEditingId(null);
            } else {
                await api.post('/api/workouts', payload);
            }
            setFormData({ ...formData, title: '', weight: '', reps: '', sets: '' });
            fetchWorkouts();
        } catch (error) {
            console.error('Помилка збереження', error);
        }
    };

    const startEdit = (workout: Workout) => {
        setEditingId(workout._id);
        // ВИПРАВЛЕНО: Жорстко витягуємо лише YYYY-MM-DD для input type="date"
        const safeDate = (workout.date || workout.createdAt).split('T')[0];

        setFormData({
            title: workout.title,
            weight: workout.weight.toString(),
            reps: workout.reps.toString(),
            sets: workout.sets.toString(),
            date: safeDate
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', weight: '', reps: '', sets: '', date: new Date().toISOString().split('T')[0] });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити цей підхід?')) return;
        try {
            await api.delete(`/api/workouts/${id}`);
            if (editingId === id) cancelEdit();
            fetchWorkouts();
        } catch (error) {
            console.error('Помилка видалення', error);
        }
    };

    // Групування для стрічки
    const groupedWorkouts = workouts.reduce((groups, workout) => {
        const targetDate = workout.date ? new Date(workout.date) : new Date(workout.createdAt);
        const dateStr = targetDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(workout);
        return groups;
    }, {} as Record<string, Workout[]>);

    // Логіка для графіка прогресу
    const uniqueExercises = Array.from(new Set(workouts.map(w => w.title.trim()))).filter(Boolean);

    useEffect(() => {
        if (!selectedChartExercise && uniqueExercises.length > 0) {
            setSelectedChartExercise(uniqueExercises[0]);
        }
    }, [workouts, selectedChartExercise, uniqueExercises]);

    // Фільтруємо історію для обраної вправи і сортуємо від старого до нового
    const exerciseHistory = workouts
        .filter(w => w.title.trim() === selectedChartExercise)
        .sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime());

    // Шукаємо максимальну вагу для правильного масштабу стовпчиків
    const maxWeight = Math.max(...exerciseHistory.map(w => w.weight), 10);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 md:p-10 text-gray-800">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Шапка */}
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 flex-wrap gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        🏋️ Журнал тренувань
                    </h1>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm">Назад</Link>
                </div>

                {/* ДОДАНО: Графік прогресу */}
                {uniqueExercises.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 overflow-hidden">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">📈 Прогрес ваги</h3>
                                <p className="text-xs text-gray-500 mt-1">Відслідковуй зростання сили у кожній вправі</p>
                            </div>
                            <select
                                value={selectedChartExercise}
                                onChange={(e) => setSelectedChartExercise(e.target.value)}
                                className="p-2.5 border border-gray-200 rounded-xl outline-none text-sm bg-white font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {uniqueExercises.map(ex => (
                                    <option key={ex} value={ex}>{ex}</option>
                                ))}
                            </select>
                        </div>

                        {exerciseHistory.length > 0 ? (
                            <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2 px-2 border-b border-gray-100">
                                {exerciseHistory.map((entry, idx) => {
                                    const heightPercentage = Math.max((entry.weight / maxWeight) * 100, 10);
                                    const displayDate = new Date(entry.date || entry.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
                                    return (
                                        <div key={idx} className="flex flex-col items-center justify-end gap-2 min-w-[48px] group flex-1 h-full relative cursor-crosshair">
                                            <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100 z-10">
                                                {entry.weight}кг
                                            </span>
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-400 to-indigo-400 rounded-t-md transition-all duration-300 group-hover:from-amber-400 group-hover:to-orange-400 opacity-80 group-hover:opacity-100"
                                                style={{ height: `${heightPercentage}%` }}
                                            ></div>
                                            <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center">{displayDate}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Немає даних для графіка.</p>
                        )}
                    </div>
                )}

                {/* Форма додавання / редагування */}
                <div className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${editingId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-white/60'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">{editingId ? '✏️ Редагування запису' : '➕ Додати підхід'}</h3>
                        {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800 font-medium">Скасувати</button>}
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Дата</label>
                            <input type="date" required className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Назва вправи</label>
                            <input type="text" required placeholder="Жим лежачи..." className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} list="exercise-suggestions" />
                            {/* Підказки для вводу */}
                            <datalist id="exercise-suggestions">
                                {uniqueExercises.map(ex => <option key={ex} value={ex} />)}
                            </datalist>
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Вага (кг)</label>
                            <input type="number" required min="0" step="0.5" className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Повтори</label>
                            <input type="number" required min="1" className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" value={formData.reps} onChange={(e) => setFormData({ ...formData, reps: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Підходи</label>
                            <input type="number" required min="1" className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800" value={formData.sets} onChange={(e) => setFormData({ ...formData, sets: e.target.value })} />
                        </div>
                        <button type="submit" className={`px-8 py-3.5 text-white font-bold rounded-2xl shadow-md transition-all ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                            {editingId ? 'Зберегти' : 'Додати'}
                        </button>
                    </form>
                </div>

                {/* Історія */}
                <div className="space-y-8">
                    {Object.keys(groupedWorkouts).length === 0 ? (
                        <div className="p-10 text-center text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-300 font-medium">Поки немає записів. Заплануй наступне тренування! 💪</div>
                    ) : (
                        Object.entries(groupedWorkouts).sort((a, b) => new Date(b[1][0].date || b[1][0].createdAt).getTime() - new Date(a[1][0].date || a[1][0].createdAt).getTime()).map(([date, dayWorkouts]) => (
                            <div key={date} className="relative">
                                <div className="sticky top-4 z-10 inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-4 border border-blue-200">{date}</div>
                                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 overflow-hidden">
                                    <ul className="divide-y divide-gray-100">
                                        {dayWorkouts.map((workout) => (
                                            <li key={workout._id} className={`p-5 flex justify-between items-center transition-all group ${editingId === workout._id ? 'bg-amber-50' : 'hover:bg-white/90'}`}>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">{workout.title}</h3>
                                                    <div className="text-gray-500 flex flex-wrap gap-3 text-sm mt-1.5">
                                                        <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg"><span className="font-bold text-blue-700">{workout.weight}</span> кг</span>
                                                        <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg"><span className="font-bold text-blue-700">{workout.reps}</span> повт.</span>
                                                        <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg"><span className="font-bold text-blue-700">{workout.sets}</span> підх.</span>
                                                    </div>
                                                </div>
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => startEdit(workout)} className="text-amber-500 hover:text-amber-700 font-medium p-2 text-sm bg-amber-50 rounded-lg hover:bg-amber-100 mr-2" title="Редагувати">✎</button>
                                                    <button onClick={() => handleDelete(workout._id)} className="text-red-500 hover:text-red-700 font-medium p-2 bg-red-50 rounded-lg hover:bg-red-100" title="Видалити">✕</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}