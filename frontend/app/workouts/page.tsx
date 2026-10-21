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
            title: formData.title,
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
        setFormData({
            title: workout.title,
            weight: workout.weight.toString(),
            reps: workout.reps.toString(),
            sets: workout.sets.toString(),
            date: workout.date || workout.createdAt.split('T')[0]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', weight: '', reps: '', sets: '', date: new Date().toISOString().split('T')[0] });
    };

    const handleDelete = async (id: string) => {
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
        const dateStr = targetDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(workout);
        return groups;
    }, {} as Record<string, Workout[]>);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        🏋️ Журнал тренувань
                    </h1>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">Назад</Link>
                </div>

                <div className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${editingId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-white/60'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">{editingId ? 'Редагування запису' : 'Додати тренування'}</h3>
                        {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800">Скасувати</button>}
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                        <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Дата</label>
                            <input type="date" required className="w-full p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Вправа</label>
                            <input type="text" required placeholder="Жим лежачи..." className="w-full p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Вага</label>
                            <input type="number" required min="0" className="w-full p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Повт.</label>
                            <input type="number" required min="1" className="w-full p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.reps} onChange={(e) => setFormData({ ...formData, reps: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Підх.</label>
                            <input type="number" required min="1" className="w-full p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.sets} onChange={(e) => setFormData({ ...formData, sets: e.target.value })} />
                        </div>
                        <button type="submit" className={`px-8 py-4 text-white font-bold rounded-2xl shadow-md transition-all ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                            {editingId ? 'Зберегти' : 'Додати'}
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    {Object.keys(groupedWorkouts).length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-300">Поки немає записів. Заплануй наступне тренування! 💪</div>
                    ) : (
                        Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
                            <div key={date} className="relative">
                                <div className="sticky top-4 z-10 inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-4 border border-blue-200">{date}</div>
                                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 overflow-hidden">
                                    <ul className="divide-y divide-gray-100/50">
                                        {dayWorkouts.map((workout) => (
                                            <li key={workout._id} className={`p-5 flex justify-between items-center transition-all group ${editingId === workout._id ? 'bg-amber-50' : 'hover:bg-white/90'}`}>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg">{workout.title}</h3>
                                                    <div className="text-gray-500 flex gap-4 text-sm mt-1">
                                                        <span className="bg-blue-50 px-2 py-1 rounded-lg"><span className="font-bold text-blue-700">{workout.weight}</span> кг</span>
                                                        <span className="bg-blue-50 px-2 py-1 rounded-lg"><span className="font-bold text-blue-700">{workout.reps}</span> повт.</span>
                                                        <span className="bg-blue-50 px-2 py-1 rounded-lg"><span className="font-bold text-blue-700">{workout.sets}</span> підх.</span>
                                                    </div>
                                                </div>
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => startEdit(workout)} className="text-amber-500 hover:text-amber-700 p-3 text-sm font-medium mr-2">Редагувати</button>
                                                    <button onClick={() => handleDelete(workout._id)} className="text-red-400 hover:text-red-600 p-3">✕</button>
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