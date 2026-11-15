'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/config/api';
import { Task, TaskStatus } from '@/types';
import TaskKanbanBoard from '@/components/tasks/TaskKanbanBoard';

export default function TasksPage() {
    const [viewMode, setViewMode] = useState<'personal' | 'family'>('personal');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [taskNotes, setTaskNotes] = useState('');
    const [taskAssignee, setTaskAssignee] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({
        title: '',
        date: '',
        notes: '',
        assignedTo: '',
        status: 'NEW',
    });

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const isShared = viewMode === 'family';
            const response = await api.get('/api/tasks', { params: { isShared } });
            setTasks(response.data);
            setErrorMsg(null);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Помилка завантаження завдань');
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    useEffect(() => {
        setTaskDate(new Date().toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (!newTaskTitle.trim()) {
            setErrorMsg('Назва завдання не може бути порожньою');
            return;
        }
        try {
            await api.post('/api/tasks', {
                title: newTaskTitle.trim(),
                date: taskDate,
                notes: taskNotes,
                assignedTo: taskAssignee,
                isShared: viewMode === 'family',
            });
            setNewTaskTitle('');
            setTaskNotes('');
            setTaskAssignee('');
            fetchTasks();
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Помилка додавання');
        }
    };

    const changeStatus = async (id: string, newStatus: TaskStatus) => {
        setTasks((prevTasks) =>
            prevTasks.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
        );
        try {
            await api.patch(`/api/tasks/${id}/edit`, { status: newStatus });
        } catch (error) {
            fetchTasks();
        }
    };

    const startEdit = (task: Task) => {
        setEditingId(task._id);
        setEditData({
            title: task.title,
            date: task.date ? task.date.split('T')[0] : '',
            notes: task.notes || '',
            assignedTo: task.assignedTo || '',
            status: task.status,
        });
    };

    const saveEdit = async (id: string) => {
        if (!editData.title.trim()) return;
        try {
            await api.patch(`/api/tasks/${id}/edit`, editData);
            setEditingId(null);
            fetchTasks();
        } catch (error: any) {
            const msg = error.response?.data?.message;
            setErrorMsg(Array.isArray(msg) ? msg[0] : msg || 'Помилка оновлення');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити завдання?')) return;
        try {
            await api.delete(`/api/tasks/${id}`);
            fetchTasks();
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Помилка видалення');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
                        📋 Дошка Завдань
                    </h1>
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                        <button
                            onClick={() => setViewMode('personal')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                viewMode === 'personal'
                                    ? 'bg-white shadow text-purple-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            👤 Мої
                        </button>
                        <button
                            onClick={() => setViewMode('family')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                viewMode === 'family'
                                    ? 'bg-white shadow text-purple-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            👨‍👩‍👧 Родина
                        </button>
                    </div>
                    <Link
                        href="/"
                        className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Назад
                    </Link>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-sm font-bold">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        ➕ Додати {viewMode === 'family' ? 'спільне' : 'особисте'} завдання
                    </h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-wrap md:flex-nowrap gap-4">
                            <input
                                type="date"
                                required
                                className="p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800 w-full sm:w-auto"
                                value={taskDate}
                                onChange={(e) => setTaskDate(e.target.value)}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Назва завдання..."
                                className="flex-1 min-w-[200px] p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Призначити на..."
                                className="w-full md:w-48 p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                value={taskAssignee}
                                onChange={(e) => setTaskAssignee(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                            <input
                                type="text"
                                placeholder="Нотатки (посилання, деталі)..."
                                className="flex-1 p-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                                value={taskNotes}
                                onChange={(e) => setTaskNotes(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md h-[52px] cursor-pointer"
                            >
                                Додати
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 font-bold">Оновлення дошки...</div>
                ) : (
                    <TaskKanbanBoard
                        tasks={tasks}
                        editingId={editingId}
                        editData={editData}
                        setEditData={setEditData}
                        setEditingId={setEditingId}
                        onStartEdit={startEdit}
                        onSaveEdit={saveEdit}
                        onDelete={handleDelete}
                        onChangeStatus={changeStatus}
                    />
                )}
            </div>
        </div>
    );
}