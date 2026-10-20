'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { api } from '@/config/api';
import CurrencyWidget from '@/components/CurrencyWidget';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/auth/profile');
        setUser(response.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="animate-pulse text-indigo-400 font-semibold text-lg">Завантаження вашого всесвіту...</div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/50 to-purple-50 p-6 md:p-10 font-sans text-gray-800">
        <div className="max-w-5xl mx-auto">

          {/* Шапка дашборду */}
          <header className="flex justify-between items-center mb-10 bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
            <div>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Life Manager
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Привіт, {user?.name || user?.email}! 👋</p>
            </div>
            <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-red-500 font-medium transition-all shadow-sm"
            >
              Вийти
            </button>
          </header>

          {/* Віджет курсів валют */}
          <CurrencyWidget />

          {/* Сітка модулів */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Тренування */}
            <Link href="/workouts" className="group block relative overflow-hidden bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🏋️</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💪</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Тренування</h3>
                <p className="text-gray-500 font-medium">Фіксуй підходи, вагу та слідкуй за своїм прогресом.</p>
              </div>
            </Link>

            {/* Фінанси */}
            <Link href="/finance" className="group block relative overflow-hidden bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">💰</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💸</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Фінанси</h3>
                <p className="text-gray-500 font-medium">Керуй доходами, витратами та тримай бюджет під контролем.</p>
              </div>
            </Link>

            {/* Завдання */}
            <Link href="/tasks" className="group block relative overflow-hidden bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(168,85,247,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">📋</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">✓</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Завдання</h3>
                <p className="text-gray-500 font-medium">Плануй свій день, створюй списки справ та досягай цілей.</p>
              </div>
            </Link>

            {/* Активність */}
            <Link href="/health" className="group block relative overflow-hidden bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🍏</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🏃</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Активність</h3>
                <p className="text-gray-500 font-medium">Контролюй норму калорій, кроки та відстежуй вагу.</p>
              </div>
            </Link>

          </div>
        </div>
      </div>
  );
}