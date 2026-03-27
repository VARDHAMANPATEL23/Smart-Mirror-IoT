"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface TickerData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  history?: number[];
}

const Sparkline = ({ data, color }: { data?: number[], color: string }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 16;
  const width = 45;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="mx-2 opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
};

export function FinanceWidget({ config, size }: { config?: any, size?: string }) {
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse tickers from widget configuration, defaulting to popular ones if missing
  const defaultTickers = "BTC-USD,ETH-USD,AAPL,TSLA";
  const userTickers = config?.tickers || defaultTickers;

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await fetch(`/api/finance?tickers=${userTickers}`);
        const result = await res.json();
        if (result.items) setData(result.items);
      } catch (err) {
        console.error("Finance Widget Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
    const refreshInterval = setInterval(fetchFinance, 1000 * 60 * 5); // Refresh every 5 mins
    return () => clearInterval(refreshInterval);
  }, [userTickers]);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
      Loading Markets...
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black/20 p-5 rounded-xl border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-cyan-500 opacity-70" />
        <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">Live Markets</span>
      </div>

      <div className={`flex-1 flex flex-col justify-around overflow-hidden ${size === '2x2' ? 'gap-4' : 'gap-2'}`}>
        {data.slice(0, size === '2x2' ? 6 : 4).map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-black/40 rounded px-4 py-3 border border-white/5">
            <span className="text-sm font-black text-white/90 tracking-tight">{item.symbol.replace('-USD', '')}</span>
            <div className="flex items-center">
              {size === '2x2' && <Sparkline data={item.history} color={item.isUp ? '#4ade80' : '#f87171'} />}
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold font-mono text-white">${item.price}</span>
                <div className={`flex items-center gap-1 text-xs font-black font-mono ${item.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{item.changePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
