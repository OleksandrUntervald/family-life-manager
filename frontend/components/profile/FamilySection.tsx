'use client';

interface FamilySectionProps {
    family: any;
    newFamilyName: string;
    setNewFamilyName: (val: string) => void;
    inviteCodeInput: string;
    setInviteCodeInput: (val: string) => void;
    onCreateFamily: (e: React.FormEvent) => void;
    onJoinFamily: (e: React.FormEvent) => void;
    onLeaveFamily: () => void;
    onCopyInviteCode: () => void;
}

export default function FamilySection({
                                          family,
                                          newFamilyName,
                                          setNewFamilyName,
                                          inviteCodeInput,
                                          setInviteCodeInput,
                                          onCreateFamily,
                                          onJoinFamily,
                                          onLeaveFamily,
                                          onCopyInviteCode,
                                      }: FamilySectionProps) {
    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-900/50">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">
                    👨‍👩‍👧 Спільний доступ (Родина)
                </h2>
                <p className="text-sm text-indigo-700/70 dark:text-indigo-400 mt-1">
                    Ведіть спільний бюджет та плануйте задачі разом
                </p>
            </div>

            {family ? (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                                Назва родини
                            </p>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                                {family.name}
                            </h3>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                            <div>
                                <p className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold">
                                    Код запрошення
                                </p>
                                <code className="text-lg font-mono font-bold text-indigo-700 dark:text-indigo-400">
                                    {family.inviteCode}
                                </code>
                            </div>
                            <button
                                onClick={onCopyInviteCode}
                                className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                title="Скопіювати код"
                            >
                                📋
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
                            Учасники ({family.members?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {family.members?.map((member: any) => (
                                <div
                                    key={member._id}
                                    className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {member.name} {family.ownerId?._id === member._id && '👑'}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                        <button
                            onClick={onLeaveFamily}
                            className="text-sm font-bold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                        >
                            Вийти з родини
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Створити нову родину
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Ви станете власником групи та отримаєте код для запрошення інших.
                        </p>
                        <form onSubmit={onCreateFamily} className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Прізвище або назва..."
                                className="flex-1 min-w-0 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 dark:text-gray-100"
                                value={newFamilyName}
                                onChange={(e) => setNewFamilyName(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm shadow-sm cursor-pointer shrink-0"
                            >
                                Створити
                            </button>
                        </form>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Приєднатися за кодом
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Введіть 8-значний код запрошення, щоб приєднатися до існуючої родини.
                        </p>
                        <form onSubmit={onJoinFamily} className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="XXXX-XXXX"
                                className="flex-1 min-w-0 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono text-gray-800 dark:text-gray-100 uppercase"
                                value={inviteCodeInput}
                                onChange={(e) => setInviteCodeInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-sm shadow-sm cursor-pointer shrink-0"
                            >
                                Вступити
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}