'use client';

interface AdminUsersTableProps {
    users: any[];
    currentUserId?: string;
    onRoleChange: (userId: string, newRole: string) => void;
    onToggleBan: (userId: string) => void;
}

export default function AdminUsersTable({
                                            users,
                                            currentUserId,
                                            onRoleChange,
                                            onToggleBan,
                                        }: AdminUsersTableProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[640px]">
                    <thead>
                    <tr className="bg-slate-800 text-white">
                        <th className="p-4">Ім&apos;я</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Поточна Роль</th>
                        <th className="p-4">Статус</th>
                        <th className="p-4">Дії (God Mode)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {users.map((u) => {
                        const isSelf = Boolean(currentUserId && String(u._id) === String(currentUserId));
                        const isProtectedSuperAdmin = u.email === 'admin@gmail.com';
                        const isLocked = isSelf || isProtectedSuperAdmin;

                        return (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold">
                                    {u.name}{' '}
                                    {isSelf && (
                                        <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        Ви
                      </span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-600">{u.email}</td>
                                <td className="p-4">
                                    <select
                                        value={u.role}
                                        disabled={isLocked}
                                        onChange={(e) => onRoleChange(u._id, e.target.value)}
                                        className={`px-3 py-1.5 border rounded-xl font-semibold text-xs outline-none ${
                                            isLocked
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white cursor-pointer'
                                        }`}
                                    >
                                        <option value="user">USER (Звичайний)</option>
                                        <option value="premium">👑 PREMIUM</option>
                                        <option value="manager">🛠️ MANAGER</option>
                                        <option value="admin">🛡️ ADMIN</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    {u.isBanned ? (
                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        Заблокований
                      </span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Активний
                      </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {isLocked ? (
                                        <span className="text-xs font-bold text-gray-400">🔒 Захищено</span>
                                    ) : (
                                        <button
                                            onClick={() => onToggleBan(u._id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
                                                u.isBanned
                                                    ? 'bg-emerald-500 hover:bg-emerald-600'
                                                    : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        >
                                            {u.isBanned ? 'Розблокувати' : 'Заблокувати'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}