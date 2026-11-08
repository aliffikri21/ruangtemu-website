export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLoginForm from "@/components/admin/admin-login-form";

export const metadata = {
  title: "Admin Login | RUANGTEMU Security Portal",
  description: "Masuk ke portal administrasi RUANGTEMU Photobooth",
};

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
