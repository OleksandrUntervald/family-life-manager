'use client';

interface HealthMetricsCardsProps {
    stats: any;
    formData: {
        consumedCalories: string;
        steps: string;
        weight: string;
        water: string;
    };
    onAddWater: (amount: number) => void;
}

export default function HealthMetricsCards({
                                               stats,
                                               formData,
                                               onAddWater,
                                           }: HealthMetricsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">🔥 Калорії (Баланс)</span>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold">
            Ціль: {stats?.dynamicCalorieGoal || 0}
          </span>
                </div>
                <div>
                    <p className="text-3xl font-extrabold text-gray-800">
                        {stats?.caloriesLeft || 0}{' '}
                        <span className="text-sm font-normal text-gray-400">залишилось</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        З&apos;їдено: <span className="font-bold text-gray-700">{formData.consumedCalories || 0}</span> | Спалено:{' '}
                        <span className="font-bold text-teal-600">+{stats?.burnedFromSteps || 0}</span>
                    </p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">👟 Кроки</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
            Ціль: 10 000
          </span>
                </div>
                <div>
                    <p className="text-3xl font-extrabold text-gray-800">{formData.steps || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Енергія від ходьби:{' '}
                        <span className="font-bold text-teal-600">~{stats?.burnedFromSteps || 0} ккал</span>
                    </p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">💧 Гідратація</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">
            Ціль: 2500 мл
          </span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-3xl font-extrabold text-gray-800">
                            {formData.water || 0} <span className="text-sm font-normal text-gray-400">мл</span>
                        </p>
                    </div>
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => onAddWater(250)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                        >
                            +250
                        </button>
                        <button
                            type="button"
                            onClick={() => onAddWater(-250)}
                            className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                        >
                            -
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}