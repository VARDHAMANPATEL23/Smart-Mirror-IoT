"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  Key,
  CheckCircle,
  Inbox,
} from "lucide-react";
import Link from "next/link";

interface EmailItem {
  id: string;
  subject: string;
  from: string;
  date: string;
}

export default function EmailsDashboard() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    saveToProfile: true,
  });
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const fetchEmails = useCallback(async (creds?: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/email/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds || {}),
      });
      const data = await res.json();
      if (res.ok) {
        setEmails(data);
        if (creds) setConfigured(true);
      } else {
        setError(data.message || "Failed to fetch emails.");
      }
    } catch {
      setError("Network error connecting to email service.");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/email/config");
      const data = await res.json();
      if (data.serviceEmail) {
        setFormData((f) => ({ ...f, email: data.serviceEmail }));
        setConfigured(true);
        fetchEmails();
      }
    } catch {}
  }, [fetchEmails]);

  useEffect(() => {
    checkConfig();
  }, [checkConfig]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.saveToProfile) {
      setSaveStatus("Saving...");
      await fetch("/api/email/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceEmail: formData.email,
          serviceAppPassword: formData.password,
        }),
      });
      setSaveStatus("Saved!");
      setTimeout(() => setSaveStatus(""), 2500);
    }
    fetchEmails({ emailAddress: formData.email, appCode: formData.password });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col safe-area-inset">
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <Link
          href="/builder"
          className="p-2 bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-xl transition text-cyan-400 touch-manipulation"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black tracking-widest text-white uppercase italic leading-none">
            MAIL HUB
          </h1>
          <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.15em] mt-0.5">
            Primary Inbox
          </p>
        </div>
        {configured && (
          <button
            onClick={() => fetchEmails()}
            disabled={loading}
            className={`p-2 bg-cyan-600/10 active:bg-cyan-600/30 rounded-xl text-cyan-400 border border-cyan-500/20 transition-all touch-manipulation ${loading ? "animate-spin opacity-50" : ""}`}
          >
            <RefreshCw size={18} />
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6">
        {/* Connection Form */}
        {!configured ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-in fade-in zoom-in duration-400">
            <div className="bg-cyan-500/10 p-6 rounded-3xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.12)]">
              <Key size={44} className="text-cyan-500" />
            </div>

            <div className="text-center space-y-1.5 max-w-xs px-2">
              <h2 className="text-xl font-black tracking-wider">
                Connect Gmail
              </h2>
              <p className="text-sm text-white/40 leading-relaxed">
                Use a{" "}
                <span className="text-cyan-400">16-character App Password</span>{" "}
                from your Google account settings.
              </p>
            </div>

            <form onSubmit={handleConnect} className="w-full space-y-4">
              {/* Gmail Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-1">
                  Gmail Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@gmail.com"
                  // font-size 16px prevents iOS zoom on focus
                  className="w-full bg-black/60 border border-white/10 focus:border-cyan-500 rounded-2xl px-4 py-4 text-base text-white placeholder-white/20 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* App Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-1">
                  App Password (16 chars)
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-black/60 border border-white/10 focus:border-cyan-500 rounded-2xl px-4 py-4 text-base text-white placeholder-white/20 font-mono outline-none transition-all tracking-widest"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* Save Checkbox — large touch target */}
              <label className="flex items-center gap-3 p-3 bg-white/3 rounded-2xl border border-white/5 cursor-pointer active:bg-white/5 transition-colors touch-manipulation select-none">
                <input
                  type="checkbox"
                  className="accent-cyan-500 w-5 h-5 rounded shrink-0"
                  checked={formData.saveToProfile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saveToProfile: e.target.checked,
                    })
                  }
                />
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Save to profile
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5">
                    Auto-connects your mirror widget
                  </p>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.25em] transition-all shadow-xl shadow-cyan-900/40 touch-manipulation"
              >
                {loading ? "CONNECTING..." : "CONNECT ACCOUNT"}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-2xl flex items-start gap-3">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom duration-400">
            {/* Stats Bar */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] uppercase tracking-widest font-black text-white/30">
                {emails.length} Unread
              </p>
              <p className="text-[11px] uppercase tracking-widest font-black text-cyan-500/50">
                Primary Only
              </p>
            </div>

            {/* Email List */}
            {loading && emails.length === 0 ? (
              <div className="flex flex-col items-center py-24 gap-4 opacity-30">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Fetching Inbox...
                </span>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center py-24 gap-3 opacity-30 text-center">
                <CheckCircle size={44} />
                <p className="text-sm font-black uppercase tracking-widest">
                  Inbox Zero
                </p>
                <p className="text-xs">No unread primary emails.</p>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/5 active:bg-black/60 active:border-cyan-500/20 transition-all duration-200 touch-manipulation"
                >
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wide truncate max-w-[75%] leading-none">
                      {email.from}
                    </span>
                    <span className="text-[10px] text-white/25 font-mono tabular-nums shrink-0">
                      {new Date(email.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white/85 line-clamp-2 leading-snug">
                    {email.subject}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Bar (connected state) */}
      {configured && (
        <footer className="sticky bottom-0 bg-neutral-950/90 backdrop-blur-xl border-t border-white/5 px-4 py-3 pb-safe flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={12} className="text-cyan-500/50 shrink-0" />
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate">
              {formData.email}
            </span>
          </div>
          <button
            onClick={() => setConfigured(false)}
            className="text-[10px] text-cyan-500 font-black uppercase tracking-widest shrink-0 ml-3 py-1 px-3 rounded-lg active:bg-cyan-500/10 transition-colors touch-manipulation"
          >
            Switch
          </button>
        </footer>
      )}

      {/* Toast notification */}
      {saveStatus && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-cyan-600 text-xs font-black uppercase px-5 py-2.5 rounded-full tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom z-50">
          {saveStatus}
        </div>
      )}
    </div>
  );
}
