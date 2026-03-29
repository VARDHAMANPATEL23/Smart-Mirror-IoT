"use client";

import React, { useEffect, useState, useRef } from "react";
import { Mail, User, Clock, Bell } from "lucide-react";

interface EmailData {
  from: string;
  subject: string;
  date: string;
  message?: string;
  id?: number;
}

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function EmailWidget({ config, mirrorId }: { config?: any; mirrorId?: string }) {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedEmail = useRef<string | null>(null);
  const resolvedPass = useRef<string | null>(null);
  const booted = useRef(false);

  // Fetches the email list and updates state
  const fetchList = async () => {
    try {
      const res = await fetch("/api/email/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mirrorId })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmails(data.map((e: any) => ({ ...e, id: e.id ?? Date.now() + Math.random() })));
        setCurrentIndex(0); // Reset to first on refresh
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    async function boot() {
      let emailAddress: string | null = config?.email || null;
      let appCode: string | null = config?.password || null;

      if (!emailAddress || !appCode) {
        try {
          const query = mirrorId ? `?mirrorId=${mirrorId}` : "";
          const res = await fetch(`/api/email/config${query}`);
          if (!res.ok) { setError("Config unavailable"); setLoading(false); return; }
          const data = await res.json();
          emailAddress = data.serviceEmail || null;
        } catch {
          setError("Failed to fetch config");
          setLoading(false);
          return;
        }
      }

      if (!emailAddress) {
        setError("Email configuration missing");
        setLoading(false);
        return;
      }

      resolvedEmail.current = emailAddress;
      resolvedPass.current = appCode;

      // Initial fetch
      await fetchList();

      // Periodic refresh every 30s
      const refreshTimer = setInterval(fetchList, REFRESH_INTERVAL);

      // Open SSE stream — credentials resolved server-side from session or mirrorId
      // Never pass email/password in the URL to avoid server log exposure
      const url = mirrorId
        ? `/api/email/stream?mirrorId=${mirrorId}`
        : `/api/email/stream`;

      const es = new EventSource(url);
      es.onmessage = (event) => {
        try {
          const newMail = JSON.parse(event.data);
          setEmails(prev => [{ ...newMail, id: Date.now() }, ...prev.slice(0, 9)]);
          setCurrentIndex(0);
          setError(null);
        } catch {}
      };
      es.onerror = () => {
        if (!emails.length) setError("Reconnecting...");
      };

      return () => {
        clearInterval(refreshTimer);
        es.close();
      };
    }

    boot();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle through emails every 8s
  useEffect(() => {
    if (emails.length <= 1) return;
    const cycleTimer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % emails.length);
    }, 8000);
    return () => clearInterval(cycleTimer);
  }, [emails.length]);

  const currentEmail = emails[currentIndex];

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
        <Mail size={14} className="mr-2" />
        Loading Inbox...
      </div>
    );
  }

  if (error && emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-red-400/50 text-[10px] uppercase tracking-widest">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black/20 p-5 rounded-xl border border-white/5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-cyan-500 opacity-70 animate-pulse" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">INBOX</span>
        </div>
        <div className="flex items-center gap-2">
          {emails.length > 1 && (
            <span className="text-[9px] font-mono text-white/15">
              {currentIndex + 1}/{emails.length}
            </span>
          )}
          <span className="text-[9px] font-mono text-cyan-500/40">{emails.length} unread</span>
        </div>
      </div>

      {/* Single Email Card */}
      {emails.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
          <Mail size={32} strokeWidth={1} />
          <p className="text-[10px] mt-2 uppercase tracking-tighter">Inbox Zero</p>
        </div>
      ) : currentEmail ? (
        <div key={currentIndex} className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={12} className="text-cyan-400 opacity-50 shrink-0" />
              <span className="text-[11px] font-bold text-cyan-400/80 truncate">{currentEmail.from}</span>
            </div>
            <p className="text-[13px] font-bold text-white leading-snug mb-3 line-clamp-3">
              {currentEmail.subject}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock size={10} className="text-white/20" />
              <span className="text-[9px] text-white/30 font-mono">
                {currentEmail.date ? new Date(currentEmail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
              </span>
            </div>
            {/* Dot indicators */}
            {emails.length > 1 && (
              <div className="flex gap-1">
                {emails.slice(0, 5).map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === currentIndex ? 'bg-cyan-500' : 'bg-white/10'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full" />
    </div>
  );
}
