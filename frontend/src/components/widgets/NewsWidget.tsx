"use client";

import React, { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  category?: string;
}

export function NewsWidget({ config }: { config?: any }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [index, setIndex] = useState(0);
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

  if (loading) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
      Loading Headlines...
    </div>
  );

  if (news.length === 0) return null;

  return (
    <div className="flex flex-col h-full bg-black/20 p-4 rounded-xl border border-white/5 group relative overflow-hidden">
      <style>{`
        @keyframes newsMarquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-news-marquee {
          animation: newsMarquee 60s linear infinite;
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-cyan-500 opacity-50" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Latest Updates</span>
        </div>
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{news.length} Feeds</div>
      </div>
      
      <div className="flex-1 flex items-center overflow-hidden w-full relative">
        <div className="flex whitespace-nowrap animate-news-marquee gap-12 items-center">
          {news.map((item, idx) => (
            <div key={idx} className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]"></span>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.category || 'News'}</span>
                <span className="text-[9px] text-white/20 font-mono">
                  {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-sm font-light text-white/90 leading-relaxed tracking-wide">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
