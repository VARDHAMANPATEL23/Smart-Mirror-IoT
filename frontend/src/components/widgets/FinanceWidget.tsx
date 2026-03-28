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
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Parse configuration: tickers and rotation interval (default 6s if not in range 5-10)
  const defaultTickers = "BTC-USD,ETH-USD,AAPL,TSLA";
  const userTickers = config?.tickers || defaultTickers;
  const intervalS = Math.min(Math.max(Number(config?.interval) || 6, 5), 10);

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
    const refreshInterval = setInterval(fetchFinance, 1000 * 60 * 5); 
    return () => clearInterval(refreshInterval);
  }, [userTickers]);

  // Handle stock rotation
  useEffect(() => {
    if (data.length <= 1) return;
    const rotateInterval = setInterval(() => {
      setIndex((i) => (i + 1) % data.length);
    }, intervalS * 1000);
    return () => clearInterval(rotateInterval);
  }, [data.length, intervalS]);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
      Loading Markets...
    </div>
  );

  if (data.length === 0) return null;
  const item = data[index];

  return (
    <div className="flex flex-col h-full bg-black/20 p-5 rounded-xl border border-white/5 relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-cyan-500 opacity-70 animate-pulse" />
          <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">{item.symbol.replace("-USD", "")}</span>
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-black font-mono ${item.isUp ? 'text-green-400' : 'text-red-400'}`}>
          {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{item.changePercent}%</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-black text-white tracking-tighter">${item.price}</span>
          <span className="text-[10px] text-white/20 uppercase font-bold">USD</span>
        </div>

        {/* 7-Day Larger Graph */}
        <div className="h-16 w-full mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <LargeSparkline data={item.history} color={item.isUp ? '#4ade80' : '#f87171'} />
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-1 mt-4">
        {data.map((_, i) => (
          <div 
            key={i} 
            className={`h-0.5 transition-all duration-300 rounded-full ${i === index ? "w-4 bg-cyan-500" : "w-1 bg-white/10"}`} 
          />
        ))}
      </div>
    </div>
  );
}

const LargeSparkline = ({ data, color }: { data?: number[], color: string }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 60;
  const width = 240;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <path d={`M ${points} V ${height} H 0 Z`} fill="url(#gradient)" className="opacity-50" />
    </svg>
  );
}

