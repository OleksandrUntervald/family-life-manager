'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';
import WorkoutProgressChart, { Workout } from '@/components/workouts/WorkoutProgressChart';
import WorkoutHistoryList from '@/components/workouts/WorkoutHistoryList';

export default function WorkoutsPage() {
    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedChartExercise, setSelectedChartExercise] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        weight: '',
        reps: '',
        sets: '',
        date: '',
    });

    const fetchWorkouts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/workouts');
            setWorkouts(response.data);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
        fetchWorkouts();
    }, [fetchWorkouts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: formData.title.trim(),
            weight: Number(formData.weight),
            reps: Number(formData.reps),
            sets: Number(formData.sets),
            date: formData.date,
        };

        try {
            if (editingId) {
                await api.patch(`/api/workouts/${editingId}`, payload);
                setEditingId(null);
            } else {
                await api.post('/api/workouts', payload);
            }
            setFormData({
                title: '',
                weight: '',
                reps: '',
                sets: '',
                date: new Date().toISOString().split('T')[0],
            });
            fetchWorkouts();
        } catch (error) {
            console.error('Помилка збереження', error);
        }
    };

    const startEdit = (workout: Workout) => {
        setEditingId(workout._id);
        const safeDate = (workout.date || workout.createdAt).split('T')[0];

        setFormData({
            title: workout.title,
            weight: workout.weight.toString(),
            reps: workout.reps.toString(),
            sets: workout.sets.toString(),
            date: safeDate,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '',
            weight: '',
            reps: '',
            sets: '',
            date: new Date().toISOString().split('T')[0],
        });
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

    const groupedWorkouts = workouts.reduce((groups, workout) => {
        const targetDate = workout.date ? new Date(workout.date) : new Date(workout.createdAt);
        const dateStr = targetDate.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(workout);
        return groups;
    }, {} as Record<string, Workout[]>);

    const uniqueExercises = Array.from(new Set(workouts.map((w) => w.title.trim()))).filter(Boolean);

    useEffect(() => {
        if (!selectedChartExercise && uniqueExercises.length > 0) {
            setSelectedChartExercise(uniqueExercises[0]);
        }
    }, [selectedChartExercise, uniqueExercises]);

    const exerciseHistory = workouts
        .filter((w) => w.title.trim() === selectedChartExercise)
        .sort(
            (a, b) =>
                new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime()
        );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                Завантаження...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 sm:p-6 md:p-10 text-gray-800">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 flex-wrap gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        🏋️ Журнал тренувань
                    </h1>
                    <Link
                        href="/"
                        className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm"
                    >
                        Назад
                    </Link>
                </div>

                <WorkoutProgressChart
                    uniqueExercises={uniqueExercises}
                    selectedExercise={selectedChartExercise}
                    onSelectExercise={setSelectedChartExercise}
                    exerciseHistory={exerciseHistory}
                />

                <div
                    className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
                        editingId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-white/60'
                    }`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">
                            {editingId ? '✏️ Редагування запису' : '➕ Додати підхід'}
                        </h3>
                        {editingId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-sm text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                            >
                                Скасувати
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Дата</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-gray-700"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Назва вправи</label>
                            <input
                                type="text"
                                required
                                placeholder="Жим лежачи..."
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                list="exercise-suggestions"
                            />
                            <datalist id="exercise-suggestions">
                                {uniqueExercises.map((ex) => (
                                    <option key={ex} value={ex} />
                                ))}
                            </datalist>
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Вага (кг)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.5"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Повтори</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800"
                                value={formData.reps}
                                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                            />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Підходи</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800"
                                value={formData.sets}
                                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`px-8 py-3.5 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer ${
                                editingId
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }`}
                        >
                            {editingId ? 'Зберегти' : 'Додати'}
                        </button>
                    </form>
                </div>

                <WorkoutHistoryList
                    groupedWorkouts={groupedWorkouts}
                    editingId={editingId}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}