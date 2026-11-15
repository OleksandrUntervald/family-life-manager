import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Отримуємо токен з cookies (Next.js middleware має доступ лише до cookies, а не до localStorage)
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Визначаємо публічні маршрути (ті, куди можна без авторизації)
    const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

    // 1. Якщо юзер НЕ залогінений і намагається зайти на закриту сторінку -> кидаємо на /login
    if (!token && !isPublicRoute) {
        // Пропускаємо запити до статики та API, щоб не зламати картинки і стилі
        if (
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname.includes('.')
        ) {
            return NextResponse.next();
        }

        // Редирект на сторінку входу
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Якщо юзер ВЖЕ залогінений, але намагається зайти на /login чи /register -> кидаємо на головну
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // В усіх інших випадках пропускаємо запит далі
    return NextResponse.next();
}

// Вказуємо, для яких маршрутів має спрацьовувати middleware
export const config = {
    matcher: [
        /*
         * Спрацьовує для всіх шляхів, ОКРІМ:
         * - api (API маршрути)
         * - _next/static (статика, CSS, JS)
         * - _next/image (оптимізовані картинки)
         * - favicon.ico (іконка сайту)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};