"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [website, setWebsite] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (website) return;
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          intent: "register",
          name,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "সমস্যা হয়েছে");
        return;
      }
      setStep("otp");
      setMsg("কোড ইমেইলে পাঠানো হয়েছে।");
    } catch {
      setMsg("নেটওয়ার্ক ত্রুটি");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const result = await signIn("user-otp", {
        email,
        code,
        redirect: false,
      });
      if (result?.error) {
        setMsg("কোড ভুল বা মেয়াদ শেষ।");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMsg("ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-16 text-zinc-100 selection:bg-red-500/30">
  {/* Background Glow */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-[10%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-red-900/10 blur-[120px]" />
  </div>

  <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 p-10 backdrop-blur-2xl shadow-2xl">
    <div className="relative z-10 text-center">
      <h1 className="text-3xl font-black tracking-tight text-white">নিবন্ধন <span className="text-red-600">করুন</span></h1>
      <p className="mt-2 text-sm text-zinc-400">
        নাম ও ইমেইল দিন — ওটিপি দিয়ে ভেরিফাই করুন।
      </p>
    </div>

    {step === "form" ? (
      <form onSubmit={sendOtp} className="relative z-10 mt-10 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">নাম</label>
          <input
            type="text"
            required
            maxLength={120}
            placeholder="আপনার পূর্ণ নাম"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">ইমেইল</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="example@gmail.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Honeypot Field */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        {msg && (
          <p className="text-center text-sm font-medium text-red-400" role="status">
            ⚠️ {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-red-600 py-4 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? "পাঠানো হচ্ছে…" : "ওটিপি পাঠান"}
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>
      </form>
    ) : (
      <form onSubmit={verify} className="relative z-10 mt-10 space-y-6 text-center">
        <div className="inline-block rounded-full bg-red-500/10 px-4 py-1 text-xs font-bold text-red-500 ring-1 ring-red-500/20">
          {email}
        </div>

        <div className="space-y-2 text-left">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">ওটিপি কোড</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {msg && (
          <p className="text-sm font-medium text-emerald-400" role="status">
            ✅ {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-red-600 py-4 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
        >
          <span className="relative z-10">
            {loading ? "যাচাই…" : "অ্যাকাউন্ট খুলুন"}
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>

        <button
          type="button"
          className="text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
          onClick={() => {
            setStep("form");
            setCode("");
            setMsg(null);
          }}
        >
          আগের ধাপে ফিরে যান
        </button>
      </form>
    )}

    <div className="mt-10 border-t border-white/5 pt-8 text-center">
      <p className="text-sm text-zinc-500">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="font-bold text-red-500 hover:text-red-400">
          লগইন করুন
        </Link>
      </p>
      <Link href="/" className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
        ← হোম পেজ
      </Link>
    </div>
  </div>
</div>
  );
}
