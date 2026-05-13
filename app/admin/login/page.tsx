"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const result = await signIn("admin", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setMsg("ভুল ইমেইল বা পাসওয়ার্ড");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setMsg("লগইন ব্যর্থ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090412] px-4 font-sans selection:bg-red-500/30">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-red-900/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-red-900/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl lg:p-10">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]">
            <span className="text-2xl font-black text-red-600 italic">PA</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            অ্যাডমিন <span className="text-red-600">এক্সেস</span>
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              অ্যাডমিন ইমেইল
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3.5 text-sm text-white outline-none ring-red-600/30 transition-all focus:border-red-600/50 focus:ring-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@proalchemist.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              সিক্রেট পাসওয়ার্ড
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3.5 text-sm text-white outline-none ring-red-600/30 transition-all focus:border-red-600/50 focus:ring-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {msg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 border border-red-500/20" role="status">
              <span>⚠️</span> {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-red-600 py-4 font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span className="relative z-10">
              {loading ? "ভেরিফাইং…" : "প্রবেশ করুন"}
            </span>
            <div className="absolute inset-0 translate-y-full bg-gradient-to-t from-black/20 to-transparent transition-transform group-hover:translate-y-0" />
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link 
            href="/" 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 transition-colors hover:text-red-500"
          >
            ← গো ব্যাক টু হোম
          </Link>
          
          <div className="h-[1px] w-12 bg-white/5" />
          
          <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">
            Powered by NodeCraft Agency
          </p>
        </div>
      </div>
    </div>
  );
}
