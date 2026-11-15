'use client';

export interface Workout {
    _id: string;
    title: string;
    weight: number;
    reps: number;
    sets: number;
    date: string;
    createdAt: string;
}

interface WorkoutProgressChartProps {
    uniqueExercises: string[];
    selectedExercise: string;
    onSelectExercise: (ex: string) => void;
    exerciseHistory: Workout[];
}

export default function WorkoutProgressChart({
                                                 uniqueExercises,
                                                 selectedExercise,
                                                 onSelectExercise,
                                                 exerciseHistory,
                                             }: WorkoutProgressChartProps) {
    if (uniqueExercises.length === 0) return null;

    const maxWeight = Math.max(...exerciseHistory.map((w) => w.weight), 10);

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 overflow-hidden">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">📈 Прогрес ваги</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Відслідковуй зростання сили у кожній вправі
                    </p>
                </div>
                <select
                    value={selectedExercise}
                    onChange={(e) => onSelectExercise(e.target.value)}
                    className="p-2.5 border border-gray-200 rounded-xl outline-none text-sm bg-white font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    {uniqueExercises.map((ex) => (
                        <option key={ex} value={ex}>
                            {ex}
                        </option>
                    ))}
                </select>
            </div>

            {exerciseHistory.length > 0 ? (
                <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2 px-2 border-b border-gray-100">
                    {exerciseHistory.map((entry, idx) => {
                        const heightPercentage = Math.max((entry.weight / maxWeight) * 100, 10);
                        const displayDate = new Date(entry.date || entry.createdAt).toLocaleDateString(
                            'uk-UA',
                            { day: 'numeric', month: 'short' }
                        );
                        return (
                            <div
                                key={idx}
                                className="flex flex-col items-center justify-end gap-2 min-w-[48px] group flex-1 h-full relative cursor-crosshair"
                            >
                <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100 z-10">
                  {entry.weight}кг
                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-400 to-indigo-400 rounded-t-md transition-all duration-300 group-hover:from-amber-400 group-hover:to-orange-400 opacity-80 group-hover:opacity-100"
                                    style={{ height: `${heightPercentage}%` }}
                                />
                                <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center">
                  {displayDate}
                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">Немає даних для графіка.</p>
            )}
        </div>
    );
}