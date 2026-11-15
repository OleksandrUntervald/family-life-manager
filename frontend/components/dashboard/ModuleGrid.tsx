'use client';

import Link from 'next/link';

export default function ModuleGrid() {
    return (
        <>
            {/* Блок швидких дій: 2 колонки на телефоні, ряд на десктопі */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 mb-8">
                <Link
                    href="/finance"
                    className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-all shadow-md text-xs sm:text-sm text-center"
                >
                    <span>➕</span> <span>Транзакція</span>
                </Link>
                <Link
                    href="/tasks"
                    className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-purple-500 text-white font-semibold rounded-2xl hover:bg-purple-600 transition-all shadow-md text-xs sm:text-sm text-center"
                >
                    <span>📋</span> <span>Нове завдання</span>
                </Link>
                <Link
                    href="/workouts"
                    className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition-all shadow-md text-xs sm:text-sm text-center"
                >
                    <span>🏋️</span> <span>Тренування</span>
                </Link>
                <Link
                    href="/analytics"
                    className="flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:opacity-95 transition-all shadow-md text-xs sm:text-sm text-center"
                >
                    <span>📈</span> <span>Аналітика</span>
                </Link>
            </div>

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
            </div>
        </>
    );
}