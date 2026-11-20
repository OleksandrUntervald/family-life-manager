'use client';

import { useEffect, useState } from 'react';
import { api } from '@/config/api';
import { Transaction, Workout, Task, TaskStatus } from '@/types';

interface ActivityItem {
    id: string;
    icon: string;
    bgClass: string;
    title: string;
    subtitle: string;
    createdAt: number;
    isShared?: boolean;
}

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
    NEW: 'Нове завдання 🆕',
    IN_PROGRESS: 'В процесі виконання ⏳',
    DONE: 'Виконано ✅',
};

export default function RecentActivityFeed() {
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecent = async () => {
            try {
                const [
                    personalFinRes,
                    familyFinRes,
                    workRes,
                    personalTaskRes,
                    familyTaskRes,
                ] = await Promise.allSettled([
                    api.get<{ data: Transaction[] }>('/api/finance?limit=5&isShared=false'),
                    api.get<{ data: Transaction[] }>('/api/finance?limit=5&isShared=true'),
                    api.get<Workout[]>('/api/workouts'),
                    api.get<Task[]>('/api/tasks?isShared=false'),
                    api.get<Task[]>('/api/tasks?isShared=true'),
                ]);

                const list: ActivityItem[] = [];

                const allFinances: Transaction[] = [
                    ...(personalFinRes.status === 'fulfilled' ? personalFinRes.value.data?.data || [] : []),
                    ...(familyFinRes.status === 'fulfilled' ? familyFinRes.value.data?.data || [] : []),
                ];

                allFinances.slice(0, 4).forEach((t) => {
                    list.push({
                        id: `fin-${t._id}`,
                        icon: t.type === 'income' ? '💵' : '💰',
                        bgClass: 'bg-green-100 dark:bg-green-900/30 text-green-600',
                        title: `${t.type === 'income' ? 'Дохід' : 'Витрата'}: ${t.title} (${t.amount} ₴)`,
                        subtitle: `Категорія: ${t.category}`,
                        createdAt: new Date(t.createdAt).getTime(),
                        isShared: t.isShared,
                    });
                });

                if (workRes.status === 'fulfilled' && Array.isArray(workRes.value.data)) {
                    workRes.value.data.slice(0, 2).forEach((w) => {
                        list.push({
                            id: `work-${w._id}`,
                            icon: '🏋️',
                            bgClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                            title: `Тренування: ${w.title}`,
                            subtitle: `${w.weight} кг × ${w.reps} повт. (${w.sets} підх.)`,
                            createdAt: new Date(w.createdAt || w.date).getTime(),
                        });
                    });
                }

                const allTasks: Task[] = [
                    ...(personalTaskRes.status === 'fulfilled' && Array.isArray(personalTaskRes.value.data)
                        ? personalTaskRes.value.data
                        : []),
                    ...(familyTaskRes.status === 'fulfilled' && Array.isArray(familyTaskRes.value.data)
                        ? familyTaskRes.value.data
                        : []),
                ];

                allTasks.slice(0, 4).forEach((task) => {
                    list.push({
                        id: `task-${task._id}`,
                        icon: task.status === 'DONE' ? '✅' : '📋',
                        bgClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
                        title: `Завдання: "${task.title}"`,
                        subtitle: TASK_STATUS_LABEL[task.status] || 'Нове завдання',
                        createdAt: new Date(task.createdAt || task.date).getTime(),
                        isShared: task.isShared,
                    });
                });

                list.sort((a, b) => b.createdAt - a.createdAt);
                setItems(list.slice(0, 6));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadRecent();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span>⚡</span> Останні дії
            </h2>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm space-y-4">
                {loading ? (
                    <p className="text-sm text-gray-400">Оновлення стрічки...</p>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Поки що немає записаних дій. Додайте перше завдання, витрату або тренування!
                    </p>
                ) : (
                    items.map((item, idx) => (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between gap-4 ${
                                idx !== items.length - 1 ? 'pb-4 border-b border-gray-100 dark:border-slate-700' : ''
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${item.bgClass} rounded-full flex items-center justify-center text-lg shrink-0`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.subtitle}
                                    </p>
                                </div>
                            </div>
                            {item.isShared && (
                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300 shrink-0">
                                    👨‍👩‍👧 Родина
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}