'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/config/api';
import { User } from '@/types';
import CurrencyWidget from '@/components/CurrencyWidget';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ModuleGrid from '@/components/dashboard/ModuleGrid';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<User>('/api/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Не вдалося завантажити профіль:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
          <div className="animate-pulse text-indigo-500 dark:text-indigo-400 font-semibold text-lg">
            Завантаження робочого простору...
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 md:p-10 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <DashboardHeader user={user} onLogout={handleLogout} />
          <CurrencyWidget />
          <ModuleGrid />
          <RecentActivityFeed />
        </div>
      </div>
  );
}