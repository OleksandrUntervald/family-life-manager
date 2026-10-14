'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/config/api';

interface UserProfile {
  id: string;
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
        // Axios автоматично підставить токен з куків завдяки нашому інтерцептору
        const response = await api.get('/api/auth/profile');
        setUser(response.data);
      } catch (error) {
        // Якщо токена немає або він недійсний - відправляємо на логін
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Завантаження...</div>;
  }

  return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Мій Дашборд</h1>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium transition-colors"
            >
              Вийти
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Інформація про профіль</h2>
            <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
            <p className="text-gray-700"><strong>Роль:</strong> <span className="uppercase text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded ml-1">{user?.role}</span></p>
            <p className="text-gray-700 text-sm mt-2"><strong>ID:</strong> {user?.id}</p>
          </div>
        </div>
      </div>
  );
}