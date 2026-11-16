"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Memverifikasi...");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Cegah double-submit

    setLoading(true);
    setLoadingText("Memverifikasi...");
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

      setLoadingText("Login berhasil! Membuka Dashboard...");
      // Gunakan window.location.href agar cookie HTTP-only terkirim secara native
      // dan browser langsung menampilkan visual loading tanpa race condition
      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.message || "Username atau password tidak valid");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center animate-in fade-in">
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
          disabled={loading}
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin / dev"
          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/30 transition-all disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">
          Password
        </label>
        <input
          type="password"
          required
          disabled={loading}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#4318FF] focus:ring-1 focus:ring-[#4318FF]/30 transition-all disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#4318FF] hover:bg-[#3311DB] active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-[#4318FF]/20 cursor-pointer flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        <span>{loading ? loadingText : "Masuk Dashboard"}</span>
      </button>
    </form>
  );
}

