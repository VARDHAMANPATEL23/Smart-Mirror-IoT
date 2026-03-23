"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RpiLoginPage() {
  const router = useRouter();
  const [mirrorId, setMirrorId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/mirror/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mirrorId, pin }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Authentication failed");
      setLoading(false);
      return;
    }

    // Store mirrorId so the display page knows which mirror it is
    localStorage.setItem("rpiMirrorId", data.mirrorId);
    router.push(`/mirror/${data.mirrorId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-950 p-8 shadow-[0_0_40px_rgba(0,200,255,0.08)]">
        <div className="mb-8 text-center">
          <div className="text-[10px] tracking-[0.3em] text-cyan-600 uppercase mb-2">Smart Mirror</div>
          <h1 className="text-2xl font-light tracking-widest text-white">RPi DISPLAY</h1>
          <p className="text-white/30 text-xs mt-1">Enter your Mirror ID and PIN</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-widest block mb-1.5">Mirror ID</label>
            <input
              type="text"
              placeholder="e.g. rpi-vardhan-01"
              required
              value={mirrorId}
              onChange={(e) => setMirrorId(e.target.value)}
              className="w-full border-b border-white/20 bg-transparent py-2.5 px-1 text-white placeholder-white/20 focus:border-cyan-500 focus:outline-none transition-colors text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-widest block mb-1.5">PIN</label>
            <input
              type="password"
              placeholder="••••••"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-b border-white/20 bg-transparent py-2.5 px-1 text-white placeholder-white/20 focus:border-cyan-500 focus:outline-none transition-colors text-sm tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-lg border border-cyan-500/40 bg-cyan-900/20 py-3 text-sm tracking-widest text-cyan-300 transition-all hover:bg-cyan-900/40 hover:border-cyan-400 disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "CONNECT TO MIRROR"}
          </button>
        </form>
      </div>
    </div>
  );
}
