'use client';

import { useEffect, useRef, useState } from 'react';
import { sma, rsi } from '../lib/indicators';

const POLL_MS = 10000;

export default function Home() {
  const [rates, setRates] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);
  const historyRef = useRef({});

  useEffect(() => {
    let active = true;

    async function fetchRates() {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        if (!active) return;

        if (data.error) {
          setError(data.error);
          return;
        }
        setError(null);
        setRates(data.rates);
        setUpdatedAt(data.updatedAt);

        data.rates.forEach(({ symbol, price }) => {
          if (!historyRef.current[symbol]) historyRef.current[symbol] = [];
          historyRef.current[symbol].push(price);
          if (historyRef.current[symbol].length > 100) {
            historyRef.current[symbol].shift();
          }
        });
      } catch (e) {
        if (active) setError(e.message);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, POLL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="container">
      <h1>لوحة الفوركس</h1>

      {error && <p style={{ color: '#ff5c5c' }}>خطأ: {error}</p>}

      {rates.map(({ symbol, price }) => {
        const hist = historyRef.current[symbol] || [];
        const sma5 = sma(hist, 5);
        const rsi14 = rsi(hist, 14);

        return (
          <div className="card" key={symbol}>
            <div>
              <div className="symbol">{symbol}</div>
              <div style={{ fontSize: 12, color: '#8a97a5' }}>
                {sma5 ? `SMA(5): ${sma5.toFixed(5)}` : 'SMA: جمع بيانات...'}
                {'  '}
                {rsi14 ? `RSI(14): ${rsi14.toFixed(1)}` : ''}
              </div>
            </div>
            <div className="price">{price.toFixed(5)}</div>
          </div>
        );
      })}

      <div className="meta">
        {updatedAt ? `آخر تحديث: ${new Date(updatedAt).toLocaleTimeString('ar')}` : 'جاري التحميل...'}
      </div>
    </div>
  );
}
