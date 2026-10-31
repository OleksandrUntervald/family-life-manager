'use client';

import { useState, useEffect } from 'react';

export default function CurrencyWidget() {
    const [rates, setRates] = useState({ usd: '...', eur: '...', crypto: '...' });
    const [loading, setLoading] = useState(true);
    const [cryptoSymbol, setCryptoSymbol] = useState('BTC');

    useEffect(() => {
        const fetchRates = async () => {
            setLoading(true);
            try {
                // НБУ: Фіатні валюти
                const nbuRes = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
                const nbuData = await nbuRes.json();
                const usd = nbuData.find((c: any) => c.cc === 'USD')?.rate || 0;
                const eur = nbuData.find((c: any) => c.cc === 'EUR')?.rate || 0;

                // Binance: Обрана криптовалюта
                const cryptoRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cryptoSymbol}USDT`);
                const cryptoData = await cryptoRes.json();
                const cryptoPrice = parseFloat(cryptoData.price) || 0;

                setRates({
                    usd: Number(usd).toFixed(2),
                    eur: Number(eur).toFixed(2),
                    crypto: Number(cryptoPrice).toLocaleString('en-US')
                });
            } catch (error) {
                console.error('Помилка завантаження курсів валют', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 300000); // Оновлення кожні 5 хв
        return () => clearInterval(interval);
    }, [cryptoSymbol]); // Перезавантажуємо при зміні монети

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Долар (USD)</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{loading && rates.usd === '...' ? '...' : rates.usd} ₴</p>
                </div>
                <div className="text-3xl">💵</div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Євро (EUR)</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{loading && rates.eur === '...' ? '...' : rates.eur} ₴</p>
                </div>
                <div className="text-3xl">💶</div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <select
                            value={cryptoSymbol}
                            onChange={(e) => setCryptoSymbol(e.target.value)}
                            className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-slate-600 outline-none cursor-pointer pb-0.5"
                        >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="SOL">Solana (SOL)</option>
                            <option value="BNB">Binance (BNB)</option>
                        </select>
                    </div>
                    <p className="text-xl font-bold text-orange-500 dark:text-orange-400">{loading ? '...' : `$${rates.crypto}`}</p>
                </div>
                <div className="text-3xl">🪙</div>
            </div>
        </div>
    );
}