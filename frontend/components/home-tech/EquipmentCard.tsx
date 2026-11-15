'use client';

export interface EquipmentItem {
    _id: string;
    name: string;
    category: 'car' | 'home' | 'other';
    lastServiceDate?: string;
    nextServiceDate?: string;
    mileageOrNote?: string;
    comment?: string;
    photoUrl?: string;
}

interface EquipmentCardProps {
    item: EquipmentItem;
    isEditing: boolean;
    onEdit: (item: EquipmentItem) => void;
    onDelete: (id: string) => void;
}

export default function EquipmentCard({
                                          item,
                                          isEditing,
                                          onEdit,
                                          onDelete,
                                      }: EquipmentCardProps) {
    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'car':
                return (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold shrink-0">
            🚗 Авто
          </span>
                );
            case 'home':
                return (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold shrink-0">
            🏠 Дім / Побут
          </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold shrink-0">
            ⚙️ Інше
          </span>
                );
        }
    };

    return (
        <div
            className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border space-y-3 flex flex-col justify-between group transition-all ${
                isEditing ? 'border-amber-300 ring-1 ring-amber-100' : 'border-white/60'
            }`}
        >
            <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-bold text-gray-800 text-base">{item.name}</h4>
                        {item.photoUrl && (
                            <a
                                href={item.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                📸 Фото
                            </a>
                        )}
                    </div>
                    {getCategoryBadge(item.category)}
                </div>

                {item.mileageOrNote && (
                    <p className="text-xs font-semibold text-blue-600">📌 {item.mileageOrNote}</p>
                )}

                <div className="text-xs text-gray-500 space-y-1 pt-1">
                    {item.lastServiceDate && (
                        <p>
                            Останнє обслуговування:{' '}
                            <span className="font-medium text-gray-700">{item.lastServiceDate}</span>
                        </p>
                    )}
                    {item.nextServiceDate && (
                        <p>
                            Наступне обслуговування:{' '}
                            <span className="font-medium text-indigo-600">{item.nextServiceDate}</span>
                        </p>
                    )}
                    {item.comment && <p className="italic text-gray-400">&quot;{item.comment}&quot;</p>}
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(item)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                    Редагувати
                </button>
                <button
                    onClick={() => onDelete(item._id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                >
                    Видалити
                </button>
            </div>
        </div>
    );
}