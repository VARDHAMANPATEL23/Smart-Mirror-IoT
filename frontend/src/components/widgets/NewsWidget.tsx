"use client";

import React, { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

export function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
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
  }, []);

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
    <div className="flex flex-col h-full bg-black/20 p-4 rounded-xl border border-white/5 group">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper size={14} className="text-cyan-500 opacity-50" />
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Latest News</span>
      </div>
      
      <div className="flex-1 flex items-center overflow-hidden">
        <div 
          key={index} 
          className="animate-in slide-in-from-bottom-2 fade-in duration-700 ease-out"
        >
          <h3 className="text-sm font-light text-white/90 leading-relaxed tracking-wide mb-1">
            {current.title}
          </h3>
          <p className="text-[10px] text-white/20 font-mono">
            {new Date(current.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      {/* Scroll indicator dots */}
      <div className="flex gap-1 mt-3">
        {news.map((_, i) => (
          <div 
            key={i} 
            className={`h-0.5 transition-all duration-500 ${i === index ? "w-4 bg-cyan-500/60" : "w-1 bg-white/10"}`} 
          />
        ))}
      </div>
    </div>
  );
}
