'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

interface Task {
    _id: string;
    title: string;
    status: TaskStatus;
    date: string;
    notes: string;
    assignedTo: string;
    createdAt: string;
}

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [taskNotes, setTaskNotes] = useState('');
    const [taskAssignee, setTaskAssignee] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ title: '', date: '', notes: '', assignedTo: '', status: 'NEW' });

    useEffect(() => {
        setTaskDate(new Date().toISOString().split('T')[0]);
        fetchTasks();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            await api.post('/api/tasks', {
                title: newTaskTitle,
                date: taskDate,
                notes: taskNotes,
                assignedTo: taskAssignee
            });
            setNewTaskTitle('');
            setTaskNotes('');
            setTaskAssignee('');
            fetchTasks();
        } catch (error) {
            console.error('Помилка додавання', error);
        }
    };

    const changeStatus = async (id: string, newStatus: TaskStatus) => {
        // Оптимістичне оновлення UI
        setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));
        try {
            await api.patch(`/api/tasks/${id}/edit`, { status: newStatus });
        } catch (error) {
            fetchTasks(); // Відкат у разі помилки
        }
    };

    const startEdit = (task: Task) => {
        setEditingId(task._id);
        setEditData({
            title: task.title,
            date: task.date ? task.date.split('T')[0] : '',
            notes: task.notes || '',
            assignedTo: task.assignedTo || '',
            status: task.status
        });
    };

    const saveEdit = async (id: string) => {
        if (!editData.title.trim()) return;
        try {
            await api.patch(`/api/tasks/${id}/edit`, editData);
            setEditingId(null);
            fetchTasks();
        } catch (error) {
            console.error('Помилка оновлення', error);
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm('Видалити завдання?')) return;
        try {
            await api.delete(`/api/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error('Помилка видалення', error);
        }
    };

    // Групуємо завдання по статусах для Канбан-дошки
    const columns: Record<TaskStatus, { title: string, color: string, tasks: Task[] }> = {
        'NEW': { title: 'Нові', color: 'bg-blue-50 border-blue-200', tasks: tasks.filter(t => (!t.status || t.status === 'NEW')) },
        'IN_PROGRESS': { title: 'В процесі', color: 'bg-amber-50 border-amber-200', tasks: tasks.filter(t => t.status === 'IN_PROGRESS') },
        'DONE': { title: 'Виконано', color: 'bg-green-50 border-green-200', tasks: tasks.filter(t => t.status === 'DONE') }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Шапка */}
                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        📋 Дошка Завдань
                    </h1>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">Назад</Link>
                </div>

                {/* Форма додавання */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-wrap md:flex-nowrap gap-4">
                            <input type="date" required className="p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
                            <input type="text" required placeholder="Назва завдання..." className="flex-1 p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                            <input type="text" placeholder="Призначити на..." className="w-48 p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} />
                        </div>
                        <div className="flex gap-4 items-end">
                            <input type="text" placeholder="Нотатки (посилання, деталі)..." className="flex-1 p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800" value={taskNotes} onChange={(e) => setTaskNotes(e.target.value)} />
                            <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md h-[52px]">Додати</button>
                        </div>
                    </form>
                </div>

                {/* Канбан Дошка */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {(Object.keys(columns) as TaskStatus[]).map((status) => (
                        <div key={status} className={`p-4 rounded-3xl border ${columns[status].color} bg-opacity-60 shadow-sm min-h-[500px] flex flex-col gap-4`}>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-bold text-gray-700">{columns[status].title}</h2>
                                <span className="bg-white/60 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">{columns[status].tasks.length}</span>
                            </div>

                            {columns[status].tasks.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-10">Тут порожньо</p>
                            ) : (
                                columns[status].tasks.map(task => (
                                    <div key={task._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 group relative">

                                        {editingId === task._id ? (
                                            <div className="flex flex-col gap-2">
                                                <input type="text" className="p-2 border rounded-lg text-sm outline-none" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                                                <input type="date" className="p-2 border rounded-lg text-sm outline-none" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} />
                                                <input type="text" placeholder="Виконавець" className="p-2 border rounded-lg text-sm outline-none" value={editData.assignedTo} onChange={e => setEditData({...editData, assignedTo: e.target.value})} />
                                                <textarea placeholder="Нотатки" className="p-2 border rounded-lg text-sm outline-none resize-none h-16" value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} />
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveEdit(task._id)} className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg font-bold">Зберегти</button>
                                                    <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 rounded-lg font-bold">Скасувати</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Заголовок і кнопки */}
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`font-bold text-gray-800 ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEdit(task)} className="text-amber-500 hover:bg-amber-50 p-1.5 rounded-md text-xs">✎</button>
                                                        <button onClick={() => handleDelete(task._id)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-md text-xs">✕</button>
                                                    </div>
                                                </div>

                                                {/* Деталі */}
                                                <div className="text-xs text-gray-500 flex flex-col gap-1.5">
                                                    <div className="flex gap-2 items-center">
                                                        <span className="bg-gray-100 px-2 py-1 rounded-md">📅 {new Date(task.date || task.createdAt).toLocaleDateString('uk-UA')}</span>
                                                        {task.assignedTo && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md">👤 {task.assignedTo}</span>}
                                                    </div>
                                                    {task.notes && <p className="bg-gray-50 p-2 rounded-md border border-gray-100 italic">{task.notes}</p>}
                                                </div>

                                                {/* Вибір статусу */}
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => changeStatus(task._id, e.target.value as TaskStatus)}
                                                    className={`mt-2 text-xs font-bold outline-none cursor-pointer border rounded-lg p-1.5 
                                                        ${task.status === 'DONE' ? 'bg-green-100 border-green-200 text-green-700' :
                                                        task.status === 'IN_PROGRESS' ? 'bg-amber-100 border-amber-200 text-amber-700' :
                                                            'bg-blue-100 border-blue-200 text-blue-700'}`
                                                    }
                                                >
                                                    <option value="NEW">Нове</option>
                                                    <option value="IN_PROGRESS">В процесі</option>
                                                    <option value="DONE">Виконано</option>
                                                </select>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}