'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

interface Task {
    _id: string;
    title: string;
    isCompleted: boolean;
    date: string;
    createdAt: string;
}

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Додали стан для обраної дати (за замовчуванням - сьогодні)
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/api/tasks');
            setTasks(response.data);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            // Відправляємо назву і обрану дату
            await api.post('/api/tasks', { title: newTaskTitle, date: taskDate });
            setNewTaskTitle('');
            fetchTasks();
        } catch (error) {
            console.error('Помилка додавання', error);
        }
    };

    const toggleTask = async (id: string) => {
        try {
            setTasks(tasks.map(task =>
                task._id === id ? { ...task, isCompleted: !task.isCompleted } : task
            ));
            await api.patch(`/api/tasks/${id}/toggle`);
            fetchTasks();
        } catch (error) {
            fetchTasks();
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error('Помилка видалення', error);
        }
    };

    // Групуємо тепер по обраній даті (або даті створення для старих записів)
    const groupedTasks = tasks.reduce((groups, task) => {
        const targetDate = task.date ? new Date(task.date) : new Date(task.createdAt);
        const dateStr = targetDate.toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        if (!groups[dateStr]) {
            groups[dateStr] = [];
        }
        groups[dateStr].push(task);
        return groups;
    }, {} as Record<string, Task[]>);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        📋 Завдання та Цілі
                    </h1>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        Назад
                    </Link>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
                    <form onSubmit={handleSubmit} className="flex flex-wrap md:flex-nowrap gap-4">
                        {/* НОВИЙ КАЛЕНДАРИК */}
                        <input
                            type="date"
                            required
                            className="p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 transition-all cursor-pointer min-w-[150px]"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                        />
                        <input
                            type="text"
                            required
                            placeholder="Нова мета або завдання..."
                            className="flex-1 p-4 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 transition-all"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <button type="submit" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all">
                            Додати
                        </button>
                    </form>
                </div>

                <div className="space-y-8">
                    {Object.keys(groupedTasks).length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                            Поки немає завдань. Заплануй щось масштабне! 🎯
                        </div>
                    ) : (
                        Object.entries(groupedTasks).map(([date, dateTasks]) => (
                            <div key={date} className="relative">
                                <div className="sticky top-4 z-10 inline-block bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-4 border border-purple-200">
                                    {date}
                                </div>
                                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 overflow-hidden">
                                    <ul className="divide-y divide-gray-100/50">
                                        {dateTasks.map((task) => (
                                            <li key={task._id} className="p-5 hover:bg-white/90 flex justify-between items-center transition-all group">
                                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task._id)}>
                                                    <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shadow-inner ${task.isCompleted ? 'bg-green-500 border-green-500' : 'bg-gray-50 border-gray-300 group-hover:border-purple-400'}`}>
                                                        {task.isCompleted && <span className="text-white text-sm font-bold">✓</span>}
                                                    </div>
                                                    <span className={`text-lg transition-all ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                            {task.title}
                          </span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-all">✕</button>
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