"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to register profile");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-black">
      {/* Background Decor */}
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/50 p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.3)]">
            <UserPlus size={28} className="text-black" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-white">
          INITIALIZE PROFILE
        </h2>
        <p className="mb-10 text-center text-xs font-mono text-white/30 tracking-[0.2em]">
          NEW IoT OPERATOR REGISTRY
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center text-[11px] text-red-400 font-mono">
             [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] text-white/20 uppercase tracking-widest ml-1">Operator Name</label>
            <input
              type="text"
              placeholder="Vardan Patel"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/20 uppercase tracking-widest ml-1">Terminal Email</label>
            <input
              type="email"
              placeholder="vardan@mirror.iot"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] text-white/20 uppercase tracking-widest ml-1">Security PIN</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-4 text-sm font-bold tracking-widest text-white transition-all hover:bg-cyan-500 hover:shadow-[0_0_25px_rgba(8,145,178,0.4)] disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "PROCESSING..." : "REGISTER PROFILE"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 tracking-wide">
            Already registered?{" "}
            <Link href="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors ml-1">
              Finalize Authentication
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
