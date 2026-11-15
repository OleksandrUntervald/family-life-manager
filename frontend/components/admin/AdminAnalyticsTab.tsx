'use client';

interface AdminAnalyticsTabProps {
    stats: any;
    activationToken: string | null;
    onGenerateToken: () => void;
}

export default function AdminAnalyticsTab({
                                              stats,
                                              activationToken,
                                              onGenerateToken,
                                          }: AdminAnalyticsTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                    <span className="text-4xl mb-2">👥</span>
                    <h3 className="text-gray-500 font-medium text-sm">Всього акаунтів</h3>
                    <p className="text-3xl font-extrabold text-slate-800">{stats?.totalUsers || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                    <span className="text-4xl mb-2">✅</span>
                    <h3 className="text-gray-500 font-medium text-sm">Активних</h3>
                    <p className="text-3xl font-extrabold text-green-600">{stats?.activeUsers || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                    <span className="text-4xl mb-2">👑</span>
                    <h3 className="text-gray-500 font-medium text-sm">Premium-користувачів</h3>
                    <p className="text-3xl font-extrabold text-amber-500">{stats?.premiumUsers || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                    <span className="text-4xl mb-2">🚫</span>
                    <h3 className="text-gray-500 font-medium text-sm">Заблокованих</h3>
                    <p className="text-3xl font-extrabold text-red-500">{stats?.bannedUsers || 0}</p>
                </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <h2 className="text-xl font-bold text-slate-800 mb-2">🔑 Генерація токенів активації</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Створіть унікальний ключ для видачі Premium доступу користувачам.
                </p>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={onGenerateToken}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        Згенерувати ключ
                    </button>

                    {activationToken && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex-1 min-w-[220px]">
                            <code className="text-base sm:text-lg font-mono font-bold text-slate-700 tracking-wider flex-1 text-center">
                                {activationToken}
                            </code>
                            <button
                                onClick={() => navigator.clipboard.writeText(activationToken)}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 cursor-pointer"
                                title="Скопіювати"
                            >
                                📋
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}