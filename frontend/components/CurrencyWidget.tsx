'use client';

import { useState, useEffect } from 'react';

export default function CurrencyWidget() {
    const [rates, setRates] = useState({ usd: '...', eur: '...', btc: '...' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Отримуємо курси фіатних валют від НБУ
                const nbuRes = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
                const nbuData = await nbuRes.json();
                const usd = nbuData.find((c: any) => c.cc === 'USD')?.rate || 0;
                const eur = nbuData.find((c: any) => c.cc === 'EUR')?.rate || 0;

                // Отримуємо курс Біткоїна від Binance
                const btcRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
                const btcData = await btcRes.json();
                const btc = parseFloat(btcData.price) || 0;

                setRates({
                    usd: Number(usd).toFixed(2),
                    eur: Number(eur).toFixed(2),
                    btc: Number(btc).toLocaleString('en-US')
                });
            } catch (error) {
                console.error('Помилка завантаження курсів валют', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
        // Оновлюємо кожні 5 хвилин
        const interval = setInterval(fetchRates, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Долар (USD)</p>
                    <p className="text-xl font-bold text-gray-800">{loading ? '...' : rates.usd} ₴</p>
                </div>
                <div className="text-3xl">💵</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Євро (EUR)</p>
                    <p className="text-xl font-bold text-gray-800">{loading ? '...' : rates.eur} ₴</p>
                </div>
                <div className="text-3xl">💶</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Bitcoin (BTC)</p>
                    <p className="text-xl font-bold text-orange-500">{loading ? '...' : `$${rates.btc}`}</p>
                </div>
                <div className="text-3xl">🪙</div>
            </div>
        </div>
    );
}