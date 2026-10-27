import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers"; // <-- Підключаємо провайдер теми

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Life Manager SaaS",
    description: "Керуй своїм життям зручно",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // suppressHydrationWarning потрібен для next-themes, щоб не було помилок при завантаженні
        <html lang="uk" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen`}
        >
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}