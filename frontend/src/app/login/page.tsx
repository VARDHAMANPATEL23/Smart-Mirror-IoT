"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/50 p-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md">
        <h2 className="mb-8 text-center text-3xl font-light tracking-widest text-white">
          MIRROR LOGIN
        </h2>

        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-white/30 bg-transparent px-2 py-3 text-white placeholder-white/50 focus:border-white focus:outline-none transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-white/30 bg-transparent px-2 py-3 text-white placeholder-white/50 focus:border-white focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-white/50 py-3 text-sm tracking-widest text-white transition-all hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "ENTER"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/50">
          New user?{" "}
          <Link href="/register" className="text-white hover:underline">
            Register for access
          </Link>
        </div>
      </div>
    </div>
  );
}
