'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const CITIES = [
    { name: 'Київ', lat: 50.45, lon: 30.52 },
    { name: 'Львів', lat: 49.84, lon: 24.02 },
    { name: 'Одеса', lat: 46.48, lon: 30.73 },
    { name: 'Дніпро', lat: 48.47, lon: 35.04 },
    { name: 'Харків', lat: 50.00, lon: 36.23 },
];

interface DashboardHeaderProps {
    user: { name?: string; email?: string; role?: string } | null;
    onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
    const [weather, setWeather] = useState<{ temp: number; isDay: number } | null>(null);
    const [selectedCity, setSelectedCity] = useState(CITIES[0].name);

    useEffect(() => {
        const savedCity = localStorage.getItem('weatherCity');
        if (savedCity && CITIES.some((c) => c.name === savedCity)) {
            setSelectedCity(savedCity);
        }
    }, []);

    useEffect(() => {
        const city = CITIES.find((c) => c.name === selectedCity) || CITIES[0];
        const fetchWeather = async () => {
            setWeather(null);
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
                );
                const data = await res.json();
                setWeather({
                    temp: Math.round(data.current_weather.temperature),
                    isDay: data.current_weather.is_day,
                });
            } catch (error) {
                console.error('Помилка погоди:', error);
            }
        };
        fetchWeather();
    }, [selectedCity]);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCity = e.target.value;
        setSelectedCity(newCity);
        localStorage.setItem('weatherCity', newCity);
    };

    const isAdmin =
        user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

    return (
        <header className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg p-4 sm:px-6 sm:py-5 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                {/* Ліва частина: Логотип + Привітання + Погода на мобільному */}
                <div className="flex items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center flex-wrap gap-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                Life Manager
                            </h1>
                            <span className="px-2.5 py-0.5 bg-gray-200/80 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-full uppercase tracking-wide">
                Панель управління
              </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                            Привіт, {user?.name || user?.email}! 👋
                        </p>
                    </div>

                    {/* Компактна погода для мобільних та планшетів */}
                    <div className="flex lg:hidden items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 shrink-0">
                        <span className="text-base">{weather?.isDay ? '☀️' : '🌙'}</span>
                        <select
                            value={selectedCity}
                            onChange={handleCityChange}
                            className="bg-transparent font-semibold text-xs outline-none cursor-pointer appearance-none"
                        >
                            {CITIES.map((city) => (
                                <option
                                    key={city.name}
                                    value={city.name}
                                    className="text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800"
                                >
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <span className="font-bold text-xs">
              {weather ? `${weather.temp > 0 ? '+' : ''}${weather.temp}°C` : '...'}
            </span>
                    </div>
                </div>

                {/* Центральна частина: Погода для десктопу */}
                <div className="hidden lg:flex justify-center">
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-blue-700 dark:text-blue-300">
                        <span className="text-lg">{weather?.isDay ? '☀️' : '🌙'}</span>
                        <select
                            value={selectedCity}
                            onChange={handleCityChange}
                            className="bg-transparent font-semibold text-sm outline-none cursor-pointer border-b border-transparent hover:border-blue-300 dark:hover:border-blue-600 pb-0.5 appearance-none"
                        >
                            {CITIES.map((city) => (
                                <option
                                    key={city.name}
                                    value={city.name}
                                    className="text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800"
                                >
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <span className="font-semibold text-sm">
              {weather ? `: ${weather.temp > 0 ? '+' : ''}${weather.temp}°C` : '...'}
            </span>
                    </div>
                </div>

                {/* Права частина: Кнопки навігації */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100 dark:border-slate-700/70">
                    <ThemeToggle />
                    <Link
                        href="/analytics"
                        className="px-3.5 py-2 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800/50 rounded-xl hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50 transition-all shadow-sm font-semibold flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                    >
                        <span>📈</span> Аналітика
                    </Link>
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="px-3.5 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 rounded-xl hover:bg-amber-100 transition-all shadow-sm font-semibold flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                        >
                            <span>🛡️</span> Адмінка
                        </Link>
                    )}
                    <Link
                        href="/profile"
                        className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-sm font-medium flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                    >
                        <span>👤</span> Профіль
                    </Link>
                    <button
                        onClick={onLogout}
                        className="px-3.5 py-2 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 font-medium transition-all shadow-sm text-xs sm:text-sm cursor-pointer ml-auto sm:ml-0"
                    >
                        Вийти
                    </button>
                </div>

            </div>
        </header>
    );
}