'use client';

interface BodySettingsFormProps {
    userParams: {
        height: number;
        age: number;
        gender: string;
        targetWeight: number;
    };
    setUserParams: (params: any) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function BodySettingsForm({
                                             userParams,
                                             setUserParams,
                                             onSubmit,
                                         }: BodySettingsFormProps) {
    return (
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-md border border-teal-200 transition-all">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
                Твої антропометричні дані (для розрахунку норм)
            </h2>
            <form onSubmit={onSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Зріст (см)</label>
                    <input
                        type="number"
                        required
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                        value={userParams.height}
                        onChange={(e) => setUserParams({ ...userParams, height: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Вік (років)</label>
                    <input
                        type="number"
                        required
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                        value={userParams.age}
                        onChange={(e) => setUserParams({ ...userParams, age: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Стать</label>
                    <select
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                        value={userParams.gender}
                        onChange={(e) => setUserParams({ ...userParams, gender: e.target.value })}
                    >
                        <option value="male">Чоловіча</option>
                        <option value="female">Жіноча</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Цільова вага (кг)</label>
                    <input
                        type="number"
                        required
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                        value={userParams.targetWeight}
                        onChange={(e) =>
                            setUserParams({ ...userParams, targetWeight: Number(e.target.value) })
                        }
                    />
                </div>
                <div className="col-span-2 md:col-span-4 flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition-all text-sm cursor-pointer"
                    >
                        Зберегти параметри
                    </button>
                </div>
            </form>
        </div>
    );
}