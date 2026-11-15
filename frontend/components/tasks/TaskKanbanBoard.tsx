'use client';

export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'DONE';

export interface Task {
    _id: string;
    title: string;
    status: TaskStatus;
    date: string;
    notes: string;
    assignedTo: string;
    createdAt: string;
    isShared?: boolean;
}

interface TaskKanbanBoardProps {
    tasks: Task[];
    editingId: string | null;
    editData: {
        title: string;
        date: string;
        notes: string;
        assignedTo: string;
        status: string;
    };
    setEditData: (data: any) => void;
    setEditingId: (id: string | null) => void;
    onStartEdit: (task: Task) => void;
    onSaveEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onChangeStatus: (id: string, newStatus: TaskStatus) => void;
}

export default function TaskKanbanBoard({
                                            tasks,
                                            editingId,
                                            editData,
                                            setEditData,
                                            setEditingId,
                                            onStartEdit,
                                            onSaveEdit,
                                            onDelete,
                                            onChangeStatus,
                                        }: TaskKanbanBoardProps) {
    const columns: Record<TaskStatus, { title: string; color: string; tasks: Task[] }> = {
        NEW: {
            title: 'Нові',
            color: 'bg-blue-50 border-blue-200',
            tasks: tasks.filter((t) => !t.status || t.status === 'NEW'),
        },
        IN_PROGRESS: {
            title: 'В процесі',
            color: 'bg-amber-50 border-amber-200',
            tasks: tasks.filter((t) => t.status === 'IN_PROGRESS'),
        },
        DONE: {
            title: 'Виконано',
            color: 'bg-green-50 border-green-200',
            tasks: tasks.filter((t) => t.status === 'DONE'),
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {(Object.keys(columns) as TaskStatus[]).map((status) => (
                <div
                    key={status}
                    className={`p-4 rounded-3xl border ${columns[status].color} bg-opacity-60 shadow-sm min-h-[420px] flex flex-col gap-4`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-gray-700">{columns[status].title}</h2>
                        <span className="bg-white/60 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">
              {columns[status].tasks.length}
            </span>
                    </div>

                    {columns[status].tasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">Тут порожньо</p>
                    ) : (
                        columns[status].tasks.map((task) => (
                            <div
                                key={task._id}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 group relative hover:shadow-md transition-shadow"
                            >
                                {editingId === task._id ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            className="p-2 border rounded-lg text-sm outline-none"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        />
                                        <input
                                            type="date"
                                            className="p-2 border rounded-lg text-sm outline-none"
                                            value={editData.date}
                                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Виконавець"
                                            className="p-2 border rounded-lg text-sm outline-none"
                                            value={editData.assignedTo}
                                            onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Нотатки"
                                            className="p-2 border rounded-lg text-sm outline-none resize-none h-16"
                                            value={editData.notes}
                                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onSaveEdit(task._id)}
                                                className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg font-bold cursor-pointer"
                                            >
                                                Зберегти
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 rounded-lg font-bold cursor-pointer"
                                            >
                                                Скасувати
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3
                                                className={`font-bold text-gray-800 ${
                                                    task.status === 'DONE' ? 'line-through text-gray-400' : ''
                                                }`}
                                            >
                                                {task.title}
                                            </h3>
                                            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    onClick={() => onStartEdit(task)}
                                                    className="text-amber-500 hover:bg-amber-50 p-1.5 rounded-md text-xs cursor-pointer"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => onDelete(task._id)}
                                                    className="text-red-400 hover:bg-red-50 p-1.5 rounded-md text-xs cursor-pointer"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 flex flex-col gap-1.5">
                                            <div className="flex flex-wrap gap-2 items-center">
                        <span className="bg-gray-100 px-2 py-1 rounded-md">
                          📅 {new Date(task.date || task.createdAt).toLocaleDateString('uk-UA')}
                        </span>
                                                {task.assignedTo && (
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold">
                            👤 {task.assignedTo}
                          </span>
                                                )}
                                            </div>
                                            {task.notes && (
                                                <p className="bg-gray-50 p-2 rounded-md border border-gray-100 italic">
                                                    {task.notes}
                                                </p>
                                            )}
                                        </div>

                                        <select
                                            value={task.status}
                                            onChange={(e) => onChangeStatus(task._id, e.target.value as TaskStatus)}
                                            className={`mt-2 text-xs font-bold outline-none cursor-pointer border rounded-lg p-1.5 ${
                                                task.status === 'DONE'
                                                    ? 'bg-green-100 border-green-200 text-green-700'
                                                    : task.status === 'IN_PROGRESS'
                                                        ? 'bg-amber-100 border-amber-200 text-amber-700'
                                                        : 'bg-blue-100 border-blue-200 text-blue-700'
                                            }`}
                                        >
                                            <option value="NEW">Нове</option>
                                            <option value="IN_PROGRESS">В процесі</option>
                                            <option value="DONE">Виконано</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
}