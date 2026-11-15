'use client';

import { Workout } from './WorkoutProgressChart';

interface WorkoutHistoryListProps {
    groupedWorkouts: Record<string, Workout[]>;
    editingId: string | null;
    onEdit: (workout: Workout) => void;
    onDelete: (id: string) => void;
}

export default function WorkoutHistoryList({
                                               groupedWorkouts,
                                               editingId,
                                               onEdit,
                                               onDelete,
                                           }: WorkoutHistoryListProps) {
    if (Object.keys(groupedWorkouts).length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-300 font-medium">
                Поки немає записів. Заплануй наступне тренування! 💪
            </div>
        );
    }

    const sortedEntries = Object.entries(groupedWorkouts).sort(
        (a, b) =>
            new Date(b[1][0].date || b[1][0].createdAt).getTime() -
            new Date(a[1][0].date || a[1][0].createdAt).getTime()
    );

    return (
        <div className="space-y-8">
            {sortedEntries.map(([date, dayWorkouts]) => (
                <div key={date} className="relative">
                    <div className="sticky top-4 z-10 inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-4 border border-blue-200">
                        {date}
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white/60 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {dayWorkouts.map((workout) => (
                                <li
                                    key={workout._id}
                                    className={`p-5 flex justify-between items-center transition-all group ${
                                        editingId === workout._id ? 'bg-amber-50' : 'hover:bg-white/90'
                                    }`}
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{workout.title}</h3>
                                        <div className="text-gray-500 flex flex-wrap gap-3 text-sm mt-1.5">
                      <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                        <span className="font-bold text-blue-700">{workout.weight}</span> кг
                      </span>
                                            <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                        <span className="font-bold text-blue-700">{workout.reps}</span> повт.
                      </span>
                                            <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                        <span className="font-bold text-blue-700">{workout.sets}</span> підх.
                      </span>
                                        </div>
                                    </div>
                                    <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => onEdit(workout)}
                                            className="text-amber-500 hover:text-amber-700 font-medium p-2 text-sm bg-amber-50 rounded-lg hover:bg-amber-100 mr-2 cursor-pointer"
                                            title="Редагувати"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => onDelete(workout._id)}
                                            className="text-red-500 hover:text-red-700 font-medium p-2 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                                            title="Видалити"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}