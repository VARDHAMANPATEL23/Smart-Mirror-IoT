"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials — verify email and password");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-black">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/50 p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.3)]">
            <ShieldCheck size={28} className="text-black" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-white">
          AUTHENTICATE
        </h2>
        <p className="mb-10 text-center text-xs font-mono text-white/30 tracking-[0.2em]">
          SECURE IoT ACCESS GATEWAY
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center text-[11px] text-red-400 font-mono">
             [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] text-white/20 uppercase tracking-widest ml-1">Email Terminal</label>
            <input
              type="email"
              placeholder="operator@mirror.iot"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-4 text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] text-white/20 uppercase tracking-widest ml-1">Pin Protocol</label>
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
            {loading ? "PROCESSING..." : "ACCESS SYSTEM"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 tracking-wide">
            Unauthorized access prohibited.{" "}
            <Link href="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors ml-1">
              Initialize Profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
