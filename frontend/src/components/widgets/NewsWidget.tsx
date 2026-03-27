"use client";

import React, { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  category?: string;
  contentSnippet?: string;
}

export function NewsWidget({ config }: { config?: any }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const providers = config?.providers || "global,national,local";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news?providers=${providers}`);
        const data = await res.json();
        if (data.items) setNews(data.items);
      } catch (err) {
        console.error("News Widget Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const refreshInterval = setInterval(fetchNews, 1000 * 60 * 30); // Refresh every 30 mins
    return () => clearInterval(refreshInterval);
  }, [providers]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (news.length === 0) return;
    const scrollInterval = setInterval(() => {
      setIndex((i) => (i + 1) % news.length);
    }, 6000); // Rotate headlines every 6 seconds
    return () => clearInterval(scrollInterval);
  }, [news]);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
      Loading Headlines...
    </div>
  );

  if (news.length === 0) return null;

  const current = news[index];

  return (
    <div className="flex flex-col h-full bg-black/20 p-4 rounded-xl border border-white/5 group relative overflow-hidden">
      <style>{`
        @keyframes headlineSnap {
          0% { transform: translateX(100%); opacity: 0; }
          10% { transform: translateX(0); opacity: 1; }
          90% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-100%); opacity: 0; }
        }
        .animate-headline-snap {
          animation: headlineSnap 6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-cyan-500 opacity-50" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{news[index]?.category || 'News'}</span>
        </div>
        <div className="text-[9px] text-white/20 font-mono">
          {new Date(news[index]?.pubDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="flex-1 flex items-center overflow-hidden w-full relative">
        <div 
          key={index} 
          className="animate-headline-snap w-full"
        >
          <h3 className="text-sm font-light text-white/90 leading-relaxed tracking-wide">
            {news[index]?.title}
          </h3>
          <p className="text-[10px] text-white/40 mt-2 line-clamp-2 leading-relaxed opacity-60">
            {news[index]?.contentSnippet}
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-1 mt-4">
        {news.slice(0, 10).map((_, i) => (
          <div 
            key={i} 
            className={`h-0.5 transition-all duration-500 rounded-full ${i === index ? "w-4 bg-cyan-500/60" : "w-1 bg-white/10"}`} 
          />
        ))}
      </div>
    </div>
  );
}
