'use client';

import { useEffect, useState } from 'react';
import { api } from '@/config/api';

interface ActivityItem {
    id: string;
    icon: string;
    bgClass: string;
    title: string;
    subtitle: string;
}

export default function RecentActivityFeed() {
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecent = async () => {
            try {
                const [finRes, workRes, taskRes] = await Promise.allSettled([
                    api.get('/api/finance'),
                    api.get('/api/workouts'),
                    api.get('/api/tasks'),
                ]);

                const list: ActivityItem[] = [];

                if (finRes.status === 'fulfilled' && Array.isArray(finRes.value.data) && finRes.value.data[0]) {
                    const t = finRes.value.data[0];
                    list.push({
                        id: `fin-${t._id}`,
                        icon: t.type === 'income' ? '💵' : '💰',
                        bgClass: 'bg-green-100 dark:bg-green-900/30 text-green-600',
                        title: `${t.type === 'income' ? 'Дохід' : 'Витрата'}: ${t.category || 'Фінанси'} (${t.amount} ₴)`,
                        subtitle: t.description || 'Остання фінансова операція',
                    });
                }

                if (workRes.status === 'fulfilled' && Array.isArray(workRes.value.data) && workRes.value.data[0]) {
                    const w = workRes.value.data[0];
                    list.push({
                        id: `work-${w._id}`,
                        icon: '🏋️',
                        bgClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                        title: `Тренування: ${w.title || w.name || w.exercise || 'Заняття в залі'}`,
                        subtitle: w.weight ? `Робоча вага: ${w.weight} кг` : 'Записано у щоденник тренувань',
                    });
                }

                if (taskRes.status === 'fulfilled' && Array.isArray(taskRes.value.data) && taskRes.value.data[0]) {
                    const task = taskRes.value.data[0];
                    list.push({
                        id: `task-${task._id}`,
                        icon: '✓',
                        bgClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
                        title: `Завдання: "${task.title}"`,
                        subtitle: task.completed ? 'Виконано ✅' : 'В процесі виконання ⏳',
                    });
                }

                setItems(list);
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
                            className={`flex items-center gap-4 ${
                                idx !== items.length - 1 ? 'pb-4 border-b border-gray-100 dark:border-slate-700' : ''
                            }`}
                        >
                            <div className={`w-10 h-10 ${item.bgClass} rounded-full flex items-center justify-center text-lg`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}