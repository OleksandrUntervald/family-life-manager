'use client';

import { useEffect, useState } from 'react';

export type CurrencyCode =
    | 'UAH'
    | 'USD'
    | 'EUR'
    | 'PLN'
    | 'GBP'
    | 'CHF'
    | 'CZK'
    | 'CAD'
    | 'JPY'
    | 'TRY'
    | 'AUD';

export const CURRENCY_META: Record<
    CurrencyCode,
    { symbol: string; label: string; flag: string; defaultRateToUAH: number }
> = {
    UAH: { symbol: '₴', label: 'Українська гривня', flag: '🇺🇦', defaultRateToUAH: 1 },
    USD: { symbol: '$', label: 'Долар США', flag: '🇺🇸', defaultRateToUAH: 41.5 },
    EUR: { symbol: '€', label: 'Євро', flag: '🇪🇺', defaultRateToUAH: 45.2 },
    PLN: { symbol: 'zł', label: 'Польський злотий', flag: '🇵🇱', defaultRateToUAH: 10.5 },
    GBP: { symbol: '£', label: 'Британський фунт', flag: '🇬🇧', defaultRateToUAH: 52.8 },
    CHF: { symbol: '₣', label: 'Швейцарський франк', flag: '🇨🇭', defaultRateToUAH: 47.4 },
    CZK: { symbol: 'Kč', label: 'Чеська крона', flag: '🇨🇿', defaultRateToUAH: 1.78 },
    CAD: { symbol: 'C$', label: 'Канадський долар', flag: '🇨🇦', defaultRateToUAH: 30.1 },
    JPY: { symbol: '¥', label: 'Японська єна', flag: '🇯🇵', defaultRateToUAH: 0.27 },
    TRY: { symbol: '₺', label: 'Турецька ліра', flag: '🇹🇷', defaultRateToUAH: 1.21 },
    AUD: { symbol: 'A$', label: 'Австралійський долар', flag: '🇦🇺', defaultRateToUAH: 27.2 },
};

const DEFAULT_RATES: Record<CurrencyCode, number> = {
    UAH: 1,
    USD: 41.5,
    EUR: 45.2,
    PLN: 10.5,
    GBP: 52.8,
    CHF: 47.4,
    CZK: 1.78,
    CAD: 30.1,
    JPY: 0.27,
    TRY: 1.21,
    AUD: 27.2,
};

const selectablePool = (Object.keys(CURRENCY_META) as CurrencyCode[]).filter(
    (code) => code !== 'UAH'
);

export default function CurrencyWidget() {
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
    const [slots, setSlots] = useState<[CurrencyCode, CurrencyCode, CurrencyCode]>([
        'USD',
        'EUR',
        'PLN',
    ]);

    useEffect(() => {
        const savedSlots = localStorage.getItem('currencyWidgetSlots');
        if (savedSlots) {
            try {
                const parsed = JSON.parse(savedSlots);
                if (
                    Array.isArray(parsed) &&
                    parsed.length === 3 &&
                    parsed.every((c) => CURRENCY_META[c as CurrencyCode])
                ) {
                    setSlots(parsed as [CurrencyCode, CurrencyCode, CurrencyCode]);
                }
            } catch (e) {}
        }

        const fetchRates = async () => {
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/UAH');
                const data = await res.json();
                if (data && data.rates) {
                    const updated: Record<CurrencyCode, number> = { ...DEFAULT_RATES };
                    (Object.keys(CURRENCY_META) as CurrencyCode[]).forEach((code) => {
                        if (code === 'UAH') {
                            updated.UAH = 1;
                        } else if (data.rates[code]) {
                            const raw = 1 / data.rates[code];
                            updated[code] = raw < 1 ? +raw.toFixed(3) : +raw.toFixed(2);
                        }
                    });
                    setRates(updated);
                    localStorage.setItem('exchangeRatesToUAH', JSON.stringify(updated));
                }
            } catch (error) {
                console.error('Використовуються резервні курси валют:', error);
            }
        };

        fetchRates();
    }, []);

    const handleSlotChange = (index: 0 | 1 | 2, newCode: CurrencyCode) => {
        const updatedSlots: [CurrencyCode, CurrencyCode, CurrencyCode] = [...slots] as [
            CurrencyCode,
            CurrencyCode,
            CurrencyCode
        ];
        updatedSlots[index] = newCode;
        setSlots(updatedSlots);
        localStorage.setItem('currencyWidgetSlots', JSON.stringify(updatedSlots));
    };

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slots.map((code, idx) => {
                    const meta = CURRENCY_META[code];

                    return (
                        <div
                            key={idx}
                            className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3 transition-all duration-300"
                        >
                            {/* Випадаючий список вибору валюти на всю ширину картки */}
                            <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-slate-700/70 px-3 py-2 rounded-2xl border border-gray-200/60 dark:border-slate-600 w-full min-w-0">
                                <span className="text-lg shrink-0">{meta.flag}</span>
                                <select
                                    value={code}
                                    onChange={(e) =>
                                        handleSlotChange(idx as 0 | 1 | 2, e.target.value as CurrencyCode)
                                    }
                                    className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-800 dark:text-gray-100 outline-none cursor-pointer truncate"
                                >
                                    {selectablePool.map((poolCode) => (
                                        <option
                                            key={poolCode}
                                            value={poolCode}
                                            className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
                                        >
                                            {poolCode} — {CURRENCY_META[poolCode].label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Курс обраної валюти */}
                            <div className="flex items-end justify-between pt-1">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        Курс до гривні
                                    </p>
                                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                                        1 {code} = {rates[code]}{' '}
                                        <span className="text-base font-bold text-indigo-500">₴</span>
                                    </p>
                                </div>
                                <span className="text-3xl font-black text-gray-200 dark:text-slate-700 select-none leading-none">
                  {meta.symbol}
                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}