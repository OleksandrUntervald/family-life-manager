'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/config/api';

type QuickModalType = 'finance' | 'task' | 'workout' | null;

interface ModuleGridProps {
    widgetsConfig?: Record<string, boolean>;
    onQuickActionSuccess?: () => void;
}

export default function ModuleGrid({ widgetsConfig, onQuickActionSuccess }: ModuleGridProps) {
    const [activeModal, setActiveModal] = useState<QuickModalType>(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [successToast, setSuccessToast] = useState<string | null>(null);

    const [txForm, setTxForm] = useState({ title: '', amount: '', category: '', type: 'expense' });
    const [taskForm, setTaskForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], notes: '' });
    const [workoutForm, setWorkoutForm] = useState({ title: '', weight: '', reps: '', sets: '' });

    const showQuickActions = widgetsConfig?.quickActions !== false;
    const showHomeTech = widgetsConfig?.homeTech === true;

    const showToast = (msg: string) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(null), 3000);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalError(null);
    };

    const handleQuickFinance = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        try {
            setSubmitting(true);
            await api.post('/api/finance', {
                title: txForm.title.trim(),
                amount: Number(txForm.amount),
                category: txForm.category.trim(),
                type: txForm.type,
                isShared: false,
            });
            setTxForm({ title: '', amount: '', category: '', type: 'expense' });
            closeModal();
            showToast('Транзакцію додано ✅');
            onQuickActionSuccess?.();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setModalError(Array.isArray(msg) ? msg[0] : msg || 'Помилка збереження');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        try {
            setSubmitting(true);
            await api.post('/api/tasks', {
                title: taskForm.title.trim(),
                date: taskForm.date,
                notes: taskForm.notes.trim(),
                isShared: false,
            });
            setTaskForm({ title: '', date: new Date().toISOString().split('T')[0], notes: '' });
            closeModal();
            showToast('Завдання додано ✅');
            onQuickActionSuccess?.();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setModalError(Array.isArray(msg) ? msg[0] : msg || 'Помилка збереження');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        try {
            setSubmitting(true);
            await api.post('/api/workouts', {
                title: workoutForm.title.trim(),
                weight: Number(workoutForm.weight),
                reps: Number(workoutForm.reps),
                sets: Number(workoutForm.sets),
                date: new Date().toISOString().split('T')[0],
            });
            setWorkoutForm({ title: '', weight: '', reps: '', sets: '' });
            closeModal();
            showToast('Тренування збережено ✅');
            onQuickActionSuccess?.();
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setModalError(Array.isArray(msg) ? msg[0] : msg || 'Помилка збереження');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {successToast && (
                <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-sm font-bold">
                    {successToast}
                </div>
            )}

            {/* Швидкі дії: додавання без переходу на іншу сторінку */}
            {showQuickActions && (
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 mb-8">
                    <button
                        type="button"
                        onClick={() => {
                            setModalError(null);
                            setActiveModal('finance');
                        }}
                        className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-all shadow-md text-xs sm:text-sm cursor-pointer"
                    >
                        <span>➕</span> <span>Транзакція</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setModalError(null);
                            setActiveModal('task');
                        }}
                        className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-purple-500 text-white font-semibold rounded-2xl hover:bg-purple-600 transition-all shadow-md text-xs sm:text-sm cursor-pointer"
                    >
                        <span>📋</span> <span>Нове завдання</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setModalError(null);
                            setActiveModal('workout');
                        }}
                        className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition-all shadow-md text-xs sm:text-sm cursor-pointer"
                    >
                        <span>🏋️</span> <span>Тренування</span>
                    </button>
                    <Link
                        href="/analytics"
                        className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:opacity-95 transition-all shadow-md text-xs sm:text-sm text-center"
                    >
                        <span>📈</span> <span>Аналітика</span>
                    </Link>
                </div>
            )}

            {/* Сітка основних модулів */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
                <Link
                    href="/workouts"
                    className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-4 sm:mb-5 shadow-inner">
                        💪
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                        Тренування
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Фіксуй робочу вагу, підходи та прогрес.
                    </p>
                </Link>

                <Link
                    href="/finance"
                    className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl mb-4 sm:mb-5 shadow-inner">
                        💸
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                        Фінанси
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Контролюй бюджет в 11 світових валютах.
                    </p>
                </Link>

                <Link
                    href="/tasks"
                    className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-4 sm:mb-5 shadow-inner">
                        ✓
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                        Завдання
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Плануй задачі та пріоритети на день.
                    </p>
                </Link>

                <Link
                    href="/health"
                    className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-4 sm:mb-5 shadow-inner">
                        🏃
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                        Активність і Здоров&apos;я
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Динаміка ваги, калорії, кроки та вода.
                    </p>
                </Link>

                <Link
                    href="/analytics"
                    className="group block relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 dark:from-violet-900/30 dark:to-fuchsia-900/30 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-fuchsia-200/70 dark:border-fuchsia-800/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-600 dark:text-fuchsia-300 rounded-2xl flex items-center justify-center text-2xl mb-4 sm:mb-5 shadow-inner">
                        📈
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                        Аналітика та Графіки
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Наочна статистика прогресу, витрат і тренувань.
                    </p>
                </Link>

                {showHomeTech && (
                    <Link
                        href="/home-tech"
                        className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl mb-4 sm:mb-5 shadow-inner">
                            ⚡
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                            Техніка та Дім
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Облік домашнього обладнання та ТО.
                        </p>
                    </Link>
                )}
            </div>

            {/* Модалка швидких дій */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {activeModal === 'finance' && '➕ Швидка транзакція'}
                                {activeModal === 'task' && '📋 Швидке завдання'}
                                {activeModal === 'workout' && '🏋️ Швидке тренування'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {modalError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                                ⚠️ {modalError}
                            </div>
                        )}

                        {activeModal === 'finance' && (
                            <form onSubmit={handleQuickFinance} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Назва (напр. Кава)"
                                    value={txForm.title}
                                    onChange={(e) => setTxForm({ ...txForm, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Сума (₴)"
                                        value={txForm.amount}
                                        onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                    />
                                    <select
                                        value={txForm.type}
                                        onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                    >
                                        <option value="expense">Витрата</option>
                                        <option value="income">Дохід</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Категорія (Їжа, Авто...)"
                                    value={txForm.category}
                                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm cursor-pointer disabled:opacity-60"
                                >
                                    {submitting ? 'Збереження...' : 'Додати транзакцію'}
                                </button>
                            </form>
                        )}

                        {activeModal === 'task' && (
                            <form onSubmit={handleQuickTask} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Назва завдання..."
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                />
                                <input
                                    type="date"
                                    required
                                    value={taskForm.date}
                                    onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Нотатки (необов'язково)"
                                    value={taskForm.notes}
                                    onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-sm cursor-pointer disabled:opacity-60"
                                >
                                    {submitting ? 'Збереження...' : 'Додати завдання'}
                                </button>
                            </form>
                        )}

                        {activeModal === 'workout' && (
                            <form onSubmit={handleQuickWorkout} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Вправа (напр. Жим лежачи)"
                                    value={workoutForm.title}
                                    onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.5"
                                        placeholder="Вага (кг)"
                                        value={workoutForm.weight}
                                        onChange={(e) => setWorkoutForm({ ...workoutForm, weight: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                    />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Повтори"
                                        value={workoutForm.reps}
                                        onChange={(e) => setWorkoutForm({ ...workoutForm, reps: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                    />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Підходи"
                                        value={workoutForm.sets}
                                        onChange={(e) => setWorkoutForm({ ...workoutForm, sets: e.target.value })}
                                        className="w-full p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm cursor-pointer disabled:opacity-60"
                                >
                                    {submitting ? 'Збереження...' : 'Зберегти підхід'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}