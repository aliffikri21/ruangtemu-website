"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Username atau password tidak valid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">
          Username / Email
        </label>
        <input
          type="text"
          required
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin / dev"
          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/30 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">
          Password
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/30 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#4318FF]/20 cursor-pointer"
      >
        {loading ? "Memverifikasi..." : "Masuk Dashboard"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#0E1626] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/10">
            <Image
              src="/logo-ruangtemu.jpg"
              alt="RUANGTEMU"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white leading-tight">
              RUANGTEMU
            </h1>
            <p className="text-xs text-white/50">Admin Security Portal</p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs text-white/40">
              Memuat formulir login...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>

        <div className="text-center pt-2 border-t border-white/5">
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
