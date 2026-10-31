'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';
import CurrencyWidget from '@/components/CurrencyWidget';
import ThemeToggle from '@/components/ThemeToggle';

interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
}

const CITIES = [
  { name: 'Київ', lat: 50.45, lon: 30.52 },
  { name: 'Львів', lat: 49.84, lon: 24.02 },
  { name: 'Одеса', lat: 46.48, lon: 30.73 },
  { name: 'Дніпро', lat: 48.47, lon: 35.04 },
  { name: 'Харків', lat: 50.00, lon: 36.23 },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{ temp: number, isDay: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState(CITIES[0].name);

  // Завантаження профілю та збереженого міста
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/me');
        setUser(response.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();

    const savedCity = localStorage.getItem('weatherCity');
    if (savedCity && CITIES.some(c => c.name === savedCity)) {
      setSelectedCity(savedCity);
    }
  }, [router]);

  // Оновлення погоди при зміні міста
  useEffect(() => {
    const city = CITIES.find(c => c.name === selectedCity) || CITIES[0];

    const fetchWeather = async () => {
      setWeather(null); // Скидаємо стан перед новим завантаженням
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
        const data = await res.json();
        setWeather({ temp: Math.round(data.current_weather.temperature), isDay: data.current_weather.is_day });
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

  const handleLogout = () => {
    Cookies.remove('access_token');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
          <div className="animate-pulse text-indigo-400 font-semibold text-lg">Завантаження...</div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 md:p-10 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">

          {/* Шапка дашборду */}
          <header className="flex justify-between items-center mb-10 bg-white/70 dark:bg-slate-800/80 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700 flex-wrap gap-4 transition-colors duration-300">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  Life Manager
                </h1>
                <span className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
                  ПАНЕЛЬ УПРАВЛІННЯ
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Привіт, {user?.name || user?.email}! 👋</p>
            </div>

            {/* Віджет погоди з вибором міста */}
            <div className="flex-grow hidden md:flex justify-center">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-blue-700 dark:text-blue-300">
                <span className="text-xl">{weather?.isDay ? '☀️' : '🌙'}</span>
                <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="bg-transparent font-semibold text-sm outline-none cursor-pointer border-b border-transparent hover:border-blue-300 dark:hover:border-blue-600 pb-0.5 appearance-none"
                >
                  {CITIES.map(city => (
                      <option key={city.name} value={city.name} className="text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800">
                        {city.name}
                      </option>
                  ))}
                </select>
                <span className="font-semibold text-sm">
                    {weather ? `: ${weather.temp > 0 ? '+' : ''}${weather.temp}°C` : '...'}
                  </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <ThemeToggle />
              <Link
                  href="/profile"
                  className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all shadow-sm font-medium flex items-center gap-2"
              >
                <span>👤</span> Профіль
              </Link>
              <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 font-medium transition-all shadow-sm"
              >
                Вийти
              </button>
            </div>
          </header>

          <CurrencyWidget />

          {/* Блок швидких дій */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/finance" className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-all shadow-md">
              <span>➕</span> Додати витрату
            </Link>
            <Link href="/tasks" className="flex items-center gap-2 px-5 py-3 bg-purple-500 text-white font-semibold rounded-2xl hover:bg-purple-600 transition-all shadow-md">
              <span>📋</span> Нове завдання
            </Link>
            <Link href="/workouts" className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 transition-all shadow-md">
              <span>🏋️</span> Записати тренування
            </Link>
          </div>

          {/* Сітка основних модулів */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link href="/workouts" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💪</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Тренування</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Фіксуй підходи та вагу.</p>
              </div>
            </Link>

            <Link href="/finance" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💸</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Фінанси</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Керуй доходами та витратами.</p>
              </div>
            </Link>

            <Link href="/tasks" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(168,85,247,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">✓</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Завдання</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Плануй свій день.</p>
              </div>
            </Link>

            <Link href="/health" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🏃</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Активність</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Контролюй вагу та калорії.</p>
              </div>
            </Link>
          </div>

          {/* Стрічка активності */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>⚡</span> Останні дії
            </h2>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">💰</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Додано нову транзакцію</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Сьогодні, 14:30</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">🏋️</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Завершено тренування "Спина/Біцепс"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Вчора, 09:15</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center">✓</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Виконано завдання "Оплатити комуналку"</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Вчора, 18:00</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
  );
}