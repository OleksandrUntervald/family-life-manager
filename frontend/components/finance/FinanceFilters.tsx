import React from 'react';

interface FinanceFiltersProps {
    filterType: string;
    setFilterType: (v: string) => void;
    filterCategory: string;
    setFilterCategory: (v: string) => void;
    sortBy: string;
    setSortBy: (v: string) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (v: 'asc' | 'desc') => void;
    handleFilterChange: () => void;
}

export const FinanceFilters: React.FC<FinanceFiltersProps> = ({
                                                                  filterType, setFilterType, filterCategory, setFilterCategory,
                                                                  sortBy, setSortBy, sortOrder, setSortOrder, handleFilterChange
                                                              }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full md:w-auto">
                <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); handleFilterChange(); }}
                    className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 outline-none"
                >
                    <option value="all">Всі типи</option>
                    <option value="income">Тільки доходи</option>
                    <option value="expense">Тільки витрати</option>
                </select>

                <input
                    type="text"
                    placeholder="Пошук за категорією..."
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); handleFilterChange(); }}
                    className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 outline-none flex-grow md:w-48"
                />
            </div>

            <div className="flex gap-2 items-center w-full md:w-auto">
                <span className="text-sm text-gray-500 font-medium">Сортування:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 outline-none"
                >
                    <option value="createdAt">За датою</option>
                    <option value="amount">За сумою</option>
                </select>
                <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="p-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                >
                    {sortOrder === 'desc' ? '⬇️' : '⬆️'}
                </button>
            </div>
        </div>
    );
};