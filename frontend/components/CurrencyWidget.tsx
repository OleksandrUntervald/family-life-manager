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

export type CryptoCode = 'BTC' | 'ETH' | 'SOL' | 'TON' | 'BNB' | 'XRP';

interface CryptoMeta {
    symbol: CryptoCode;
    name: string;
    icon: string;
    binancePair: string;
    defaultUSD: number;
}

const CRYPTO_POOL: Record<CryptoCode, CryptoMeta> = {
    BTC: { symbol: 'BTC', name: 'Bitcoin', icon: '₿', binancePair: 'BTCUSDT', defaultUSD: 89500 },
    ETH: { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', binancePair: 'ETHUSDT', defaultUSD: 3150 },
    SOL: { symbol: 'SOL', name: 'Solana', icon: '◎', binancePair: 'SOLUSDT', defaultUSD: 195 },
    TON: { symbol: 'TON', name: 'Toncoin', icon: '💎', binancePair: 'TONUSDT', defaultUSD: 5.4 },
    BNB: { symbol: 'BNB', name: 'BNB', icon: '🔶', binancePair: 'BNBUSDT', defaultUSD: 620 },
    XRP: { symbol: 'XRP', name: 'Ripple', icon: '✕', binancePair: 'XRPUSDT', defaultUSD: 1.1 },
};

const selectableFiatPool = (Object.keys(CURRENCY_META) as CurrencyCode[]).filter(
    (code) => code !== 'UAH'
);
const selectableCryptoPool = Object.keys(CRYPTO_POOL) as CryptoCode[];

export default function CurrencyWidget() {
    const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
    const [fiatSlots, setFiatSlots] = useState<[CurrencyCode, CurrencyCode, CurrencyCode]>([
        'USD',
        'EUR',
        'PLN',
    ]);

    const [selectedCrypto, setSelectedCrypto] = useState<CryptoCode>('BTC');
    const [cryptoPrices, setCryptoPrices] = useState<
        Record<CryptoCode, { price: number; change24h: number }>
    >({
        BTC: { price: 89500, change24h: 2.4 },
        ETH: { price: 3150, change24h: 1.8 },
        SOL: { price: 195, change24h: 4.1 },
        TON: { price: 5.4, change24h: 0.9 },
        BNB: { price: 620, change24h: 1.2 },
        XRP: { price: 1.1, change24h: -0.5 },
    });

    useEffect(() => {
        const savedFiat = localStorage.getItem('currencyWidgetSlots');
        if (savedFiat) {
            try {
                const parsed = JSON.parse(savedFiat);
                if (
                    Array.isArray(parsed) &&
                    parsed.length === 3 &&
                    parsed.every((c) => CURRENCY_META[c as CurrencyCode])
                ) {
                    setFiatSlots(parsed as [CurrencyCode, CurrencyCode, CurrencyCode]);
                }
            } catch (e) {}
        }

        const savedCrypto = localStorage.getItem('selectedCryptoSlot') as CryptoCode;
        if (savedCrypto && CRYPTO_POOL[savedCrypto]) {
            setSelectedCrypto(savedCrypto);
        }

        const fetchFiatRates = async () => {
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

        const fetchCryptoRates = async () => {
            try {
                const symbolsQuery = JSON.stringify(
                    selectableCryptoPool.map((code) => CRYPTO_POOL[code].binancePair)
                );
                const res = await fetch(
                    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsQuery)}`
                );
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCryptoPrices((prev) => {
                        const next = { ...prev };
                        data.forEach((item: any) => {
                            const foundCode = selectableCryptoPool.find(
                                (c) => CRYPTO_POOL[c].binancePair === item.symbol
                            );
                            if (foundCode) {
                                const rawPrice = parseFloat(item.lastPrice);
                                next[foundCode] = {
                                    price: rawPrice < 10 ? +rawPrice.toFixed(3) : Math.round(rawPrice),
                                    change24h: +parseFloat(item.priceChangePercent).toFixed(2),
                                };
                            }
                        });
                        return next;
                    });
                }
            } catch (error) {
                console.error('Використовуються резервні курси крипти:', error);
            }
        };

        fetchFiatRates();
        fetchCryptoRates();
    }, []);

    const handleFiatSlotChange = (index: 0 | 1 | 2, newCode: CurrencyCode) => {
        const updated: [CurrencyCode, CurrencyCode, CurrencyCode] = [...fiatSlots] as [
            CurrencyCode,
            CurrencyCode,
            CurrencyCode
        ];
        updated[index] = newCode;
        setFiatSlots(updated);
        localStorage.setItem('currencyWidgetSlots', JSON.stringify(updated));
    };

    const handleCryptoChange = (newCode: CryptoCode) => {
        setSelectedCrypto(newCode);
        localStorage.setItem('selectedCryptoSlot', newCode);
    };

    const cryptoMeta = CRYPTO_POOL[selectedCrypto];
    const cryptoInfo = cryptoPrices[selectedCrypto] || {
        price: cryptoMeta.defaultUSD,
        change24h: 0,
    };
    const isCryptoPositive = cryptoInfo.change24h >= 0;

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 3 слоти фіатних валют */}
                {fiatSlots.map((code, idx) => {
                    const meta = CURRENCY_META[code];

                    return (
                        <div
                            key={`fiat-${idx}`}
                            className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/60 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-slate-700/70 px-3 py-2 rounded-2xl border border-gray-200/60 dark:border-slate-600 w-full min-w-0">
                                <span className="text-lg shrink-0">{meta.flag}</span>
                                <select
                                    value={code}
                                    onChange={(e) =>
                                        handleFiatSlotChange(idx as 0 | 1 | 2, e.target.value as CurrencyCode)
                                    }
                                    className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 outline-none cursor-pointer truncate"
                                >
                                    {selectableFiatPool.map((poolCode) => (
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

                            <div className="flex items-end justify-between pt-1">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                        Курс до гривні
                                    </p>
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 whitespace-nowrap">
                                        1 {code} = {rates[code]}{' '}
                                        <span className="text-sm font-bold text-indigo-500">₴</span>
                                    </p>
                                </div>
                                <span className="text-2xl font-black text-gray-200 dark:text-slate-700 select-none leading-none">
                  {meta.symbol}
                </span>
                            </div>
                        </div>
                    );
                })}

                {/* 1 слот криптовалюти */}
                <div className="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-amber-200/70 dark:border-amber-800/40 shadow-sm flex flex-col justify-between gap-3 transition-all duration-300">
                    <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                        <div className="flex items-center gap-1.5 bg-amber-50/90 dark:bg-slate-700/70 px-2.5 py-2 rounded-2xl border border-amber-200/60 dark:border-slate-600 min-w-0 flex-1">
                            <span className="text-base font-bold text-amber-500 shrink-0">{cryptoMeta.icon}</span>
                            <select
                                value={selectedCrypto}
                                onChange={(e) => handleCryptoChange(e.target.value as CryptoCode)}
                                className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 outline-none cursor-pointer truncate"
                            >
                                {selectableCryptoPool.map((cCode) => (
                                    <option
                                        key={cCode}
                                        value={cCode}
                                        className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100"
                                    >
                                        {cCode} — {CRYPTO_POOL[cCode].name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <span
                            className={`shrink-0 px-2 py-1 rounded-xl text-[11px] font-bold ${
                                isCryptoPositive
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            }`}
                        >
              {isCryptoPositive ? `+${cryptoInfo.change24h}%` : `${cryptoInfo.change24h}%`}
            </span>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                                ≈ {Math.round(cryptoInfo.price * rates.USD).toLocaleString('uk-UA')} ₴
                            </p>
                            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 whitespace-nowrap">
                                ${cryptoInfo.price.toLocaleString('en-US')}
                            </p>
                        </div>
                        <span className="text-2xl font-black text-amber-500/25 dark:text-amber-400/15 select-none leading-none">
              {cryptoMeta.icon}
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
}