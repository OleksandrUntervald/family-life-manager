'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) {
        return null;
    }

    const links = [
        { href: '/', label: 'Головна', icon: '🏠' },
        { href: '/finance', label: 'Фінанси', icon: '💰' },
        { href: '/tasks', label: 'Завдання', icon: '📋' },
        { href: '/health', label: 'Активність', icon: '🍏' },
        { href: '/workouts', label: 'Тренування', icon: '🏋️' },
        { href: '/profile', label: 'Профіль', icon: '👤' },
    ];

    return (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 py-3">
                    {links.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}