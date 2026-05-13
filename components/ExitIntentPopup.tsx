"use client";

import { useEffect, useState } from "react";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // চেক করার ফাংশন: আগে দেখা হয়েছে কি না
    const hasSeenPopup = () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("exit_popup_seen") === "true";
      }
      return false;
    };

    const onLeave = (e: MouseEvent) => {
      // যদি ইউজার কারসার উপরের দিকে নেয় (Exit Intent) এবং আগে না দেখে থাকে
      if (e.clientY <= 0 && !hasSeenPopup()) {
        localStorage.setItem("exit_popup_seen", "true");
        setOpen(true);
      }
    };

    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-w-lg overflow-hidden rounded-[2rem] border border-red-500/30 bg-[#0f0f0f] p-8 text-white shadow-[0_0_50px_-12px_rgba(220,38,38,0.5)]">
        
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-600/10 blur-3xl" />
        
        <button
          type="button"
          aria-label="বন্ধ"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-red-600 hover:text-white"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-500">
            Wait! Dont Miss Out 
          </div>
          
          <h2 className="text-3xl font-black leading-tight tracking-tighter">
            এক মিনিট! <br />
            আজকের এই <span className="text-red-500">৳১৯৯ Lifetime</span> অফারটি হাতছাড়া করবেন না!
          </h2>
          
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            মাসে মাসে ২০০৳ খরচ করার চেয়ে একবার ১৯৯৳ দিয়ে আজীবনের জন্য নিশ্চিন্ত হওয়া কি বুদ্ধিমানের কাজ নয়? 
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/register"
              className="flex-1 rounded-xl bg-red-600 px-6 py-4 text-center text-lg font-bold transition-all hover:bg-red-700 active:scale-95"
            >
              অফারটি নিন
            </a>
            <button
              type="button"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-zinc-300 transition-all hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              না, পরে দেখবো
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            প্রথম ১০০ সেলের পর মূল্য আপডেট হয়ে ৫৯৯৳ হয়ে যাবে।
          </div>
        </div>
      </div>
    </div>
  );
}