'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Чекаємо монтування, щоб уникнути помилок гідратації іконок
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Перемкнути тему"
        >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}