"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentPage() {
  const router = useRouter();
  const [bkashNumber, setBkashNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [trxId, setTrxId] = useState("");
  const [amountTaka, setAmountTaka] = useState("199");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (website) return;
    if (!file) {
      setMsg("স্ক্রিনশট আপলোড করুন");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      const upJson = await up.json();
      if (!up.ok) {
        setMsg(upJson.error || "আপলোড ব্যর্থ");
        return;
      }

      const pay = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          bkashNumber,
          senderName,
          trxId,
          amountTaka: Number(amountTaka),
          screenshotUrl: upJson.url,
          screenshotPublicId: upJson.publicId,
        }),
      });
      const pj = await pay.json();
      if (!pay.ok) {
        setMsg(pj.error || "জমা দিতে পারিনি");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMsg("নেটওয়ার্ক ত্রুটি");
    } finally {
      setLoading(false);
    }
  }

  return (
   <div className="min-h-screen bg-[#0a0a0a] px-4 py-20 text-zinc-100 selection:bg-red-500/30">
  {/* Background Glow */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-[10%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-red-900/10 blur-[120px]" />
  </div>

  <div className="relative mx-auto max-w-lg overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-8 backdrop-blur-2xl shadow-2xl">
    <div className="mb-8">
  <h1 className="text-3xl font-black tracking-tight text-white">
    পেমেন্ট <span className="text-red-600">জমা দিন</span>
  </h1>
  
  {/* বক্সে পেমেন্ট নম্বর */}
  <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-md">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/80">বিকাশ (Personal)</p>
    <div className="mt-1 flex items-center justify-between">
      <span className="text-2xl font-mono font-bold tracking-wider text-white">+8801310515702</span>
      <button 
        onClick={() => navigator.clipboard.writeText('01310515702')}
        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors hover:bg-red-600 hover:text-white"
      >
        COPY
      </button>
    </div>
  </div>

  <p className="mt-4 text-sm leading-relaxed text-zinc-400">
    উপরের নম্বরে <span className="font-bold text-zinc-200">৳১৯৯</span> পেমেন্ট করে ট্রানজাকশন ডিটেইলস নিচে প্রদান করুন।
  </p>
</div>

    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">বিকাশ নম্বর</label>
        <input
          required
          placeholder="017XXXXXXXX"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
          value={bkashNumber}
          onChange={(e) => setBkashNumber(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">বিকাশ নাম</label>
        <input
          required
          placeholder="আপনার নাম লিখুন"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">ট্রানজাকশন আইডি</label>
          <input
            required
            placeholder="TRX123456"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">পরিমাণ (৳)</label>
          <input
            type="number"
            min={1}
            required
            placeholder="১৯৯"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            value={amountTaka}
            onChange={(e) => setAmountTaka(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">পেমেন্ট স্ক্রিনশট</label>
        <div className="relative flex w-full items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 py-6 transition-all hover:border-red-500/30">
          <input
            type="file"
            accept="image/*"
            required
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="text-center">
            <span className="text-sm font-medium text-zinc-400">
              {file ? file.name : "ফাইল সিলেক্ট করুন বা ড্র্যাগ করুন"}
            </span>
            <p className="mt-1 text-[10px] text-zinc-500 uppercase tracking-tighter">Max Size: 5MB</p>
          </div>
        </div>
      </div>

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
        <div className="rounded-lg bg-red-500/10 p-3 text-center text-xs font-medium text-red-400 border border-red-500/20">
          ⚠️ {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-xl bg-red-600 py-4 font-bold text-white transition-all hover:bg-red-700 disabled:opacity-60"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
             <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : "পেমেন্ট জমা দিন"}
        </span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    </form>

    <div className="mt-8 border-t border-white/5 pt-6 text-center">
      <Link href="/dashboard" className="group text-sm font-bold text-zinc-500 transition-colors hover:text-red-500">
        <span className="inline-block transition-transform group-hover:-translate-x-1">←</span> ফিরে যান
      </Link>
    </div>
  </div>
</div>
  );
}
