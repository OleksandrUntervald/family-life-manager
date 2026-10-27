'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/config/api';

interface EquipmentItem {
    _id: string;
    name: string;
    category: 'car' | 'home' | 'other';
    lastServiceDate?: string;
    nextServiceDate?: string;
    mileageOrNote?: string;
    comment?: string;
    photoUrl?: string; // Додали поле фото
}

export default function HomeTechPage() {
    const router = useRouter();
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null); // Стан для файлу

    const [formData, setFormData] = useState({
        name: '',
        category: 'car',
        lastServiceDate: '',
        nextServiceDate: '',
        mileageOrNote: '',
        comment: ''
    });

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/home-tech');
            setItems(res.data);
        } catch (error) {
            console.error('Помилка завантаження даних', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Використовуємо FormData для файлів
        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('category', formData.category);
        payload.append('lastServiceDate', formData.lastServiceDate);
        payload.append('nextServiceDate', formData.nextServiceDate);
        payload.append('mileageOrNote', formData.mileageOrNote);
        payload.append('comment', formData.comment);
        if (file) {
            payload.append('file', file);
        }

        try {
            if (editingId) {
                await api.patch(`/api/home-tech/${editingId}`, payload);
                setEditingId(null);
            } else {
                await api.post('/api/home-tech', payload);
            }
            setFormData({
                name: '', category: 'car', lastServiceDate: '', nextServiceDate: '', mileageOrNote: '', comment: ''
            });
            setFile(null);
            const fileInput = document.getElementById('equipment-file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            fetchItems();
        } catch (error) {
            console.error('Помилка збереження запису', error);
        }
    };

    const startEdit = (item: EquipmentItem) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            category: item.category,
            lastServiceDate: item.lastServiceDate || '',
            nextServiceDate: item.nextServiceDate || '',
            mileageOrNote: item.mileageOrNote || '',
            comment: item.comment || ''
        });
        setFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', category: 'car', lastServiceDate: '', nextServiceDate: '', mileageOrNote: '', comment: '' });
        setFile(null);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/home-tech/${id}`);
            if (editingId === id) cancelEdit();
            fetchItems();
        } catch (error) {
            console.error('Помилка видалення', error);
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'car':
                return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">🚗 Авто</span>;
            case 'home':
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">🏠 Дім / Побут</span>;
            default:
                return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">⚙️ Інше</span>;
        }
    };

    if (loading && items.length === 0) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-50">Завантаження...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 p-6 md:p-10 text-gray-800">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center bg-white/70 backdrop-blur-lg px-6 py-4 rounded-3xl shadow-sm border border-white/50">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            🛠️ Дім та Техніка
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Обслуговування авто (Mazda / Jeep) та побутового обладнання</p>
                    </div>
                    <Link href="/" className="px-5 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium text-sm">
                        Назад
                    </Link>
                </div>

                <div className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${editingId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-white/60'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Редагування запису' : 'Додати запис про обслуговування'}
                        </h3>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800">
                                Скасувати
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Назва (напр. Mazda 3 - Заміна мастила)</label>
                            <input
                                type="text" required placeholder="Введіть назву..."
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Категорія</label>
                            <select
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            >
                                <option value="car">Автомобіль</option>
                                <option value="home">Дім / Побут (Фільтри, Інвертор)</option>
                                <option value="other">Інше</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Дата останнього обслуговування</label>
                            <input
                                type="date"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                                value={formData.lastServiceDate} onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Наступне обслуговування (план)</label>
                            <input
                                type="date"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                                value={formData.nextServiceDate} onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Пробіг або примітка</label>
                            <input
                                type="text" placeholder="Наприклад: 185 000 км або заміна картриджів"
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                                value={formData.mileageOrNote} onChange={(e) => setFormData({ ...formData, mileageOrNote: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Коментар</label>
                            <input
                                type="text" placeholder="Додаткові деталі..."
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
                                value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            />
                        </div>

                        {/* ДОДАНО: Блок для завантаження фотографії (на всю ширину) */}
                        <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-200 mt-2 gap-4">
                            <div className="w-full md:w-auto">
                                <label className="block text-xs font-medium text-gray-500 mb-2">Фото (чека, деталі, звіту)</label>
                                <input
                                    id="equipment-file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer w-full"
                                />
                            </div>
                            <button type="submit" className={`w-full md:w-auto px-8 py-3 text-white font-bold rounded-2xl shadow-md transition-all text-sm ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'}`}>
                                {editingId ? 'Зберегти зміни' : 'Зберегти запис'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Список обслуговування</h3>
                    {items.length === 0 ? (
                        <div className="bg-white/80 p-8 rounded-3xl text-center text-gray-400 border border-white/60">
                            Поки немає жодного запису. Додай своє перше авто або побутову систему вище!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <div key={item._id} className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border space-y-3 flex flex-col justify-between group transition-all ${editingId === item._id ? 'border-amber-300 ring-1 ring-amber-100' : 'border-white/60'}`}>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-800 text-base">{item.name}</h4>
                                                {/* ДОДАНО: Відображення посилання на фото */}
                                                {item.photoUrl && (
                                                    <a href={item.photoUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
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
                                            {item.lastServiceDate && <p>Останнє обслуговування: <span className="font-medium text-gray-700">{item.lastServiceDate}</span></p>}
                                            {item.nextServiceDate && <p>Наступне обслуговування: <span className="font-medium text-indigo-600">{item.nextServiceDate}</span></p>}
                                            {item.comment && <p className="italic text-gray-400">"{item.comment}"</p>}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="text-xs text-amber-500 hover:text-amber-700 font-medium bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-lg transition-all"
                                        >
                                            Редагувати
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}