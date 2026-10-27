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

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Стейт для модального вікна заявки на Преміум
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [telegram, setTelegram] = useState('');
  const [plan, setPlan] = useState('Family Premium PRO');
  const [comment, setComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  const isPremiumOrAdmin = user?.role === 'premium' || user?.role === 'admin' || user?.role === 'super_admin';
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  const handlePremiumFeatureClick = (featureName: string) => {
    if (isPremiumOrAdmin) {
      alert(`🎉 Фіча "${featureName}" активна для вашого ${user?.role?.toUpperCase()} акаунту! Налаштування відкриються у наступному оновленні.`);
    } else {
      setSelectedFeature(featureName);
      setSubmitSuccess(false);
      setIsModalOpen(true);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/premium-requests', {
        telegram,
        plan,
        comment: comment || `Хочу підключити модуль: ${selectedFeature}`,
      });
      setSubmitSuccess(true);
      setTelegram('');
      setComment('');
    } catch (error) {
      alert('Помилка при відправці заявки');
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
          <div className="animate-pulse text-indigo-400 font-semibold text-lg">Завантаження вашого всесвіту...</div>
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
                {isPremiumOrAdmin ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                    👑 {user?.role?.toUpperCase()}
                  </span>
                ) : (
                    <span className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
                    FREE ПЛАН
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Привіт, {user?.name || user?.email}! 👋</p>
            </div>

            {/* Блок з кнопками користувача */}
            <div className="flex items-center gap-3 flex-wrap">

              <ThemeToggle />

              {isAdminOrManager && (
                  <Link
                      href="/admin"
                      className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm font-medium flex items-center gap-2"
                  >
                    <span>🛡️</span> Адмін-панель (CRM)
                  </Link>
              )}
              {!isPremiumOrAdmin && (
                  <button
                      onClick={() => handlePremiumFeatureClick('Повний доступ до Premium')}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-all shadow-sm font-semibold flex items-center gap-2"
                  >
                    <span>⭐</span> Отримати Premium
                  </button>
              )}
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

          {/* Сітка основних модулів */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            <Link href="/workouts" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🏋️</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💪</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Тренування</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Фіксуй підходи, вагу та слідкуй за своїм прогресом.</p>
              </div>
            </Link>

            <Link href="/finance" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(34,197,94,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">💰</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">💸</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Фінанси</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Керуй доходами, витратами та тримай бюджет під контролем.</p>
              </div>
            </Link>

            <Link href="/tasks" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(168,85,247,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">📋</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">✓</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Завдання</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Плануй свій день, створюй списки справ та досягай цілей.</p>
              </div>
            </Link>

            <Link href="/health" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🍏</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🏃</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Активність</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Контролюй норму калорій, кроки та відстежуй вагу.</p>
              </div>
            </Link>

            <Link href="/home-tech" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🛠️</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🚗</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Дім та Техніка</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Обслуговування авто, фільтрів та побутового обладнання.</p>
              </div>
            </Link>

            <Link href="/analytics" className="group block relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl border border-white/60 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">📈</span>
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">📊</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Аналітика</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Візуалізація прогресу ваги, витрат та активності у графіках.</p>
              </div>
            </Link>
          </div>

          {/* Секція Преміум-модулів */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span>👑</span> Можливості Premium (Life Manager 2.0)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Розширений функціонал для автоматизації та сімейного доступу</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Telegram-Бот', icon: '🤖', desc: 'Автоматичні нагадування про ТО авто, фільтри та завдання прямо в месенджер.' },
              { title: 'Сімейний Режим', icon: '👨‍👩‍👧', desc: 'Спільний сімейний бюджет та список справ із дружиною чи командою.' },
              { title: 'Хмарні Фото-Чеки', icon: '📸', desc: 'Прикріплення фотографій чеків до витрат та фото актів виконаних робіт.' },
              { title: 'Темна Тема (PRO)', icon: '🌙', desc: 'Ексклюзивний нічний режим інтерфейсу та кастомізація кольорових схем.' },
            ].map((item) => (
                <div
                    key={item.title}
                    onClick={() => handlePremiumFeatureClick(item.title)}
                    className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/30 dark:to-orange-900/30 p-6 rounded-3xl border border-amber-200/70 dark:border-amber-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                      {item.icon}
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${isPremiumOrAdmin ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-200/80 text-amber-800 dark:bg-amber-800/60 dark:text-amber-300'}`}>
                    {isPremiumOrAdmin ? '🔓 Активно' : '🔒 PRO'}
                  </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
            ))}
          </div>
        </div>

        {/* Модальне вікно оформлення заявки на Преміум */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span>👑</span> Заявка на Premium
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold">✕</button>
                </div>

                {submitSuccess ? (
                    <div className="text-center py-6">
                      <div className="text-5xl mb-3">✅</div>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Заявку успішно прийнято!</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Наша служба підтримки вже отримала ваш контакт і зв'яжеться з вами у Telegram для активації преміум-доступу.
                      </p>
                      <button
                          onClick={() => setIsModalOpen(false)}
                          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                      >
                        Чудово, чекаю!
                      </button>
                    </div>
                ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                        Функція <b>«{selectedFeature}»</b> доступна лише для Premium-акаунтів. Залиште ваш нікнейм у Telegram, і менеджер підключить вам доступ!
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Ваш Telegram (обов'язково)</label>
                        <input
                            type="text"
                            required
                            placeholder="@username або +380..."
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Оберіть тарифний план</label>
                        <select
                            value={plan}
                            onChange={(e) => setPlan(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white"
                        >
                          <option value="Family Premium PRO">Family Premium PRO ($99 / рік)</option>
                          <option value="Personal VIP">Personal VIP ($199 / назавжди)</option>
                          <option value="Family Minimal">Family Minimal ($15 / міс)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Коментар (опціонально)</label>
                        <textarea
                            rows={2}
                            placeholder="Які функції цікавлять найбільше?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white"
                        />
                      </div>

                      <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-95 transition-all shadow-md"
                      >
                        Відправити заявку в підтримку
                      </button>
                    </form>
                )}
              </div>
            </div>
        )}
      </div>
  );
}