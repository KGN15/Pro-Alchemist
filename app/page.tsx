"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function useCountdown(hours = 23, minutes = 59, seconds = 40) {
  const [time, setTime] = useState({ h: hours, m: minutes, s: seconds });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        const { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Floating Orbs ────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[
        { cx: "-5%", cy: "-5%", size: 600, color: "bg-red-900/25", delay: 0 },
        { cx: "90%", cy: "15%", size: 500, color: "bg-zinc-800/40", delay: 2 },
        { cx: "50%", cy: "60%", size: 400, color: "bg-red-950/20", delay: 4 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} blur-[140px]`}
          style={{ left: orb.cx, top: orb.cy, width: orb.size, height: orb.size }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 12 + i * 3, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}
    </div>
  );
}

// ─── Section Fade-in wrapper ──────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isMounted && inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {/* মাউন্ট হওয়ার আগে চিলড্রেন রেন্ডার করবে না অথবা কঙ্কাল দেখাবে */}
      {isMounted ? children : <div className="invisible">{children}</div>}
    </motion.div>
  );
}

// ─── Sticky Nav ───────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/[0.08] bg-black/70 backdrop-blur-2xl shadow-2xl shadow-black/50" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tighter text-white">
          <motion.span
            className="rounded bg-red-600 px-1.5 py-0.5 text-sm uppercase italic"
            whileHover={{ scale: 1.1, rotate: -3 }}
          >
            Pro
          </motion.span>
          ALCHEMIST
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            লগইন
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="group relative flex items-center gap-1 overflow-hidden rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-red-500 hover:text-white"
            >
              নিবন্ধন
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  );
}

// ─── Social Proof Bar ─────────────────────────────────────────────────────────
function SocialProofBar() {
  const [liveCount] = useState(35 + Math.floor(Math.random() * 10));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-3 text-xs font-medium text-zinc-400 backdrop-blur-md"
    >
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        এখন <span className="font-bold text-white mx-1">{liveCount} জন</span> দেখছেন
      </span>
      <span className="text-white/20">|</span>
      <span>🔥 <span className="text-yellow-400 font-bold">মাত্র ১২ সীট বাকি!</span></span>
      <span className="text-white/20">|</span>
      <span>✅ <span className="text-zinc-200">৫০০+ Editor ইতিমধ্যে জয়েন করেছে</span></span>
    </motion.div>
  );
}

// ─── Pricing Strip ────────────────────────────────────────────────────────────
function PricingStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/60 to-zinc-950/60 px-6 py-3 backdrop-blur-md"
    >
      <span className="text-zinc-400 line-through text-sm">৳১,৯৯০</span>
      <span className="text-3xl font-black text-white">৳১৯৯</span>
      <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">৯০% ছাড়</span>
      <span className="text-zinc-500 text-xs">একবার পেমেন্ট · লাইফটাইম</span>
    </motion.div>
  );
}

// ─── Problem Card ─────────────────────────────────────────────────────────────
function ProblemCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, borderColor: "rgba(239,68,68,0.3)" }}
      className="flex items-start gap-4 rounded-2xl border border-white/6 bg-white/3 p-5 transition-colors backdrop-blur-sm"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="font-bold text-zinc-200">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(239,68,68,0.15)" }}
        className="group relative h-full overflow-hidden rounded-3xl border border-white/6 bg-gradient-to-b from-white/6 to-transparent p-8 transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 transition-all duration-500 group-hover:from-red-500/5 group-hover:to-transparent" />
        <div className="mb-4 text-4xl">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{desc}</p>
      </motion.div>
    </FadeUp>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ name, role, text, initial, delay }: {
  name: string; role: string; text: string; initial: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="relative rounded-3xl border border-white/8 bg-gradient-to-b from-white/6 to-white/2 p-7 backdrop-blur-sm"
    >
      <div className="mb-4 flex text-yellow-400 text-sm">★★★★★</div>
      <p className="text-sm leading-relaxed text-zinc-300">{text}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold text-white">
          {initial}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-xs text-zinc-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a, delay }: { q: string; a: React.ReactNode; delay: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-white/6 bg-white/4 backdrop-blur-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="font-bold text-white">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="ml-4 shrink-0 text-red-400"
        >
          ↓
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="border-t border-white/6 px-6 pb-6 pt-4 text-sm leading-relaxed text-zinc-400">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Exit Intent Popup ────────────────────────────────────────────────────────
function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (e.clientY < 10) setShow(true); };
    document.addEventListener("mouseleave", fn);
    return () => document.removeEventListener("mouseleave", fn);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative max-w-md w-full rounded-3xl border border-red-500/40 bg-zinc-950 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShow(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white text-lg"
            >✕</button>
            <div className="mb-3 text-5xl">🚨</div>
            <h3 className="text-2xl font-black text-white">অপেক্ষা করুন!</h3>
            <p className="mt-3 text-zinc-400 text-sm">এই অফার আজকেই শেষ হচ্ছে। চলে গেলে আর এই দামে পাবেন না।</p>
            <div className="my-5 text-4xl font-black text-white">৳১৯৯ <span className="text-base text-zinc-500 line-through">৳১,৯৯০</span></div>
            <Link
              href="/register"
              onClick={() => setShow(false)}
              className="block w-full rounded-2xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              হ্যাঁ, আমি এক্সেস নিতে চাই →
            </Link>
            <button onClick={() => setShow(false)} className="mt-3 text-xs text-zinc-600 hover:text-zinc-400">
              না, আমি টাকা নষ্ট করতে চাই
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const countdown = useCountdown(23, 59, 40);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080808] text-zinc-100 selection:bg-red-500/30">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-red-600 to-red-400"
        style={{ scaleX }}
      />

      <FloatingOrbs />

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2240%22%20height=%2240%22%3E%3Cpath%20d=%22M0%2040h40V0H0%22%20fill=%22none%22%20stroke=%22%23ffffff%22%20stroke-opacity=%22.025%22/%3E%3C/svg%3E')]" />

      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pb-32 pt-28">

        {/* ── HERO ── */}
        <section className="relative pt-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">সীমিত সময়ের লঞ্চিং অফার</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-7xl"
          >
            ক্যাপকাট প্রো-এর জন্য এক্সপোর্ট{" "}
            <br />
            <motion.span
              className="bg-gradient-to-b from-red-400 to-red-700 bg-clip-text text-transparent inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              আটকে যাচ্ছে?
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400"
          >
            মাসে মাসে ২০০৳ নষ্ট করা বন্ধ করুন। কোনো ক্র্যাক বা ভাইরাস ছাড়াই আপনার নিজের পার্সোনাল পিসি থেকে{" "}
            <span className="font-semibold text-zinc-200">প্রো ফিচার ব্যবহার করে ভিডিও এক্সপোর্ট</span>{" "}
            করার ১০০% লিগ্যাল সিক্রেট মেথড।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10"
          >
            <PricingStrip />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-10 text-xl font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:shadow-red-800/60 sm:w-auto"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                />
                <span className="relative z-10">এখনই এক্সেস নিন — ৳১৯৯</span>
              </Link>
            </motion.div>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
              <span>✅ ওয়ান-টাইম পেমেন্ট</span>
              <span>✅ লাইফটাইম আপডেট</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8"
          >
            <SocialProofBar />
          </motion.div>
        </section>

        {/* ── STATS ── */}
<FadeUp className="mt-24">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-8 backdrop-blur-sm sm:grid-cols-4">
        {[
    { label: "একটিভ ইউজার", value: 500, suffix: "+" },
    { label: "আপটাইম গ্যারান্টি", value: 99, suffix: ".9%" },
    { label: "সাপোর্ট", value: 24, suffix: "/7" },
    { label: "সন্তুষ্ট গ্রাহক", value: 98, suffix: "%" },
  ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-black text-white">
              {/* শুধুমাত্র ক্লায়েন্ট সাইডে কাউন্টারটি রান হবে */}
              {isClient ? (
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              ) : (
                <span>0{s.suffix}</span>
              )}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
          </div>
        ))}
      </div>
    </FadeUp>

        {/* ── PROBLEM ── */}
        <section className="mt-32">
          <FadeUp>
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-red-500">আপনি কি এই সমস্যায়?</div>
            <h2 className="text-center text-4xl font-black text-white sm:text-5xl">
              প্রতি মাসে টাকা{" "}
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">পুড়ে যাচ্ছে?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-zinc-500">
              বেশিরভাগ কন্টেন্ট ক্রিয়েটর এই ৫টি সমস্যায় আটকে আছে — আপনি কি তাদের একজন?
            </p>
          </FadeUp>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { icon: "💸", title: "প্রতি মাসে ২০০৳+ সাবস্ক্রিপশন ফি", desc: "বছরে ২,৪০০৳ শুধু ক্যাপকাটেই চলে যাচ্ছে", delay: 0 },
              { icon: "🦠", title: "ক্র্যাক ফাইলে ভাইরাসের ভয়", desc: "ফ্রি ভার্সন ডাউনলোড করতে গিয়ে পিসি শেষ", delay: 0.1 },
              { icon: "⏰", title: "প্রতি মাসে রিনিউ করার ঝামেলা", desc: "পেমেন্ট মিস = সব ফিচার বন্ধ", delay: 0.2 },
              { icon: "🔴", title: "Shared ID ব্যান হওয়ার রিস্ক", desc: "যেকোনো দিন আইডি লক হয়ে যাবে", delay: 0.3 },
              { icon: "😤", title: "এক্সপোর্টে ওয়াটারমার্ক", desc: "ফ্রি ভার্সনে ব্র্যান্ডিং রুইন হয়ে যায়", delay: 0.4 },
            ].map((p) => (
              <ProblemCard key={p.title} {...p} />
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-5"
            >
              <p className="text-center font-bold text-red-400">কিন্তু এখন সমাধান আছে 👇</p>
            </motion.div>
          </div>
        </section>

        {/* ── SOLUTION / COMPARISON ── */}
        <section className="mt-32">
          <FadeUp>
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-green-500">সমাধান পেয়ে গেছেন</div>
            <h2 className="text-center text-4xl font-black text-white sm:text-5xl">কেন আমাদের মেথড আলাদা?</h2>
          </FadeUp>

          <FadeUp delay={0.2} className="mt-10">
            <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] sm:grid-cols-2">
              {/* Left — bad side */}
              <div className="bg-[#0e0e0e] p-10 sm:border-r sm:border-white/[0.08]">
                <h3 className="mb-8 flex items-center gap-3 text-xl font-bold text-zinc-500">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-base">❌</span>
                  অন্যান্য শেয়ার্ড সাবস্ক্রিপশন
                </h3>
                <ul className="space-y-5">
                  {[
                    "মাসে ২০০৳+ সাবস্ক্রিপশন ফি",
                    "লগআউট বা আইডি ব্যানের ভয়",
                    "ক্র্যাক ফাইলের মাধ্যমে ভাইরাস রিস্ক",
                    "প্রতি মাসে রিনিউ করার ঝামেলা",
                    "যেকোনো সময় সার্ভিস বন্ধ হয়ে যেতে পারে",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-zinc-500">
                      <span className="mt-0.5 shrink-0 text-red-500/50 text-lg leading-none">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — good side */}
              <div className="relative bg-gradient-to-br from-red-950/30 via-zinc-950/80 to-zinc-950 p-10">
                
                <h3 className="mb-8 flex items-center gap-3 text-xl font-bold text-red-400">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-base">✅</span>
                  Alchemist Secret Method
                </h3>
                <ul className="space-y-5">
                  {[
                    "মাত্র ১৯৯৳ (লাইফটাইম এক্সেস)",
                    "আপনার নিজের পার্সোনাল আইডি",
                    "১০০% নিরাপদ ও ভাইরাস মুক্ত",
                    "একবার সেটআপ, আজীবন মুক্তি",
                    "যেকোনো সময় ব্যবহার করুন",
                  ].map((item, idx) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.07 }}
                      className="flex items-start gap-3 font-semibold text-zinc-200"
                    >
                      <span className="mt-0.5 shrink-0 text-green-400 text-lg leading-none">✓</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section className="mt-32">
          <FadeUp>
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-red-500">কি কি পাচ্ছেন</div>
            <h2 className="text-center text-4xl font-black text-white sm:text-5xl">
              ৳১৯৯ তে যা যা পাচ্ছেন
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-zinc-500">
              অন্যরা এই সুবিধার জন্য প্রতি মাসে হাজার টাকা নেয়
            </p>
          </FadeUp>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "📁", title: "রিসোর্স বাইপাস গাইড", desc: "ক্যাপকাটের ইন্টারনাল ডিরেক্টরি ব্যবহার করে প্রো ফিচার আনলক করার স্টেপ-বাই-স্টেপ ভিডিও।" },
              { icon: "⚡", title: "ইনস্ট্যান্ট ড্যাশবোর্ড", desc: "পেমেন্ট ভেরিফাই হওয়ার সাথে সাথে আপনার পার্সোনাল ড্যাশবোর্ডে মেথডটি আনলক হয়ে যাবে।" },
              { icon: "🛠️", title: "প্রিমিয়াম সাপোর্ট", desc: "যেকোনো টেকনিক্যাল সমস্যায় সরাসরি NodeCraft Agency-এর সাপোর্ট টিম থেকে সাহায্য।" },
              { icon: "🔄", title: "লাইফটাইম আপডেট", desc: "ক্যাপকাট আপডেট হলে আমাদের মেথডও আপডেট হবে — কোনো এক্সট্রা চার্জ ছাড়াই।" },
              { icon: "📱", title: "মোবাইলেও কাজ করে", desc: "পিসি ছাড়াও মোবাইল থেকে একই মেথড অ্যাপ্লাই করতে পারবেন।" },
              { icon: "🎓", title: "ভিডিও টিউটোরিয়াল", desc: "বাংলায় ধাপে ধাপে ভিডিও গাইড — একদম নতুনরাও সহজে করতে পারবে।" },
            ].map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.08} />
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="mt-32">
          <FadeUp>
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-red-500">কিভাবে কাজ করে</div>
            <h2 className="text-center text-4xl font-black text-white sm:text-5xl">মাত্র ৩ ধাপে শেষ</h2>
          </FadeUp>

          <div className="mt-14 relative">
            {/* Connector line */}
            <div className="absolute left-1/2 top-12 hidden h-[calc(100%-96px)] w-px -translate-x-1/2 bg-gradient-to-b from-red-500/50 via-red-500/20 to-transparent sm:block" />

            <div className="space-y-10">
              {[
                { step: "01", title: "পেমেন্ট করুন", desc: "মাত্র ৳১৯৯ দিয়ে ওয়ান-টাইম পেমেন্ট করুন। তাৎক্ষণিক কনফার্মেশন পাবেন।", icon: "💳" },
                { step: "02", title: "ড্যাশবোর্ড অ্যাক্সেস", desc: "পেমেন্ট হওয়ার সাথে সাথে আপনার ইমেইলে লগইন ডিটেইলস পাঠানো হবে।", icon: "🖥️" },
                { step: "03", title: "মেথড অ্যাপ্লাই করুন", desc: "ভিডিও গাইড ফলো করুন — ৫ মিনিটেই ক্যাপকাট প্রো ফিচার আনলক।", icon: "🚀" },
              ].map((s, i) => (
                <FadeUp key={s.step} delay={i * 0.15}>
                  <div className={`flex items-start gap-6 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                    <div className="relative shrink-0">
                      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/80 to-zinc-950 text-4xl shadow-lg shadow-red-900/30">
                        {s.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">
                        {s.step}
                      </div>
                    </div>
                    <div className="pt-3">
                      <h3 className="text-2xl font-black text-white">{s.title}</h3>
                      <p className="mt-2 max-w-md text-zinc-400">{s.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="mt-32">
          <FadeUp>
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-red-500">রিভিউ</div>
            <h2 className="text-center text-4xl font-black text-white sm:text-5xl">
              তারা কেন Alchemist বেছে নিলেন
            </h2>
          </FadeUp>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { name: "রাকিব হাসান", role: "ভিডিও এডিটর", initial: "র", delay: 0, text: "আগে মাসে ২০০৳ দিতাম। এখন ১৯৯৳ দিয়ে লাইফটাইম পেয়ে গেছি। Instant CapCut Paid Video Export!" },
              {
                name: "ফাতেমা আক্তার", role: "কন্টেন্ট ক্রিয়েটর", initial: "ফ", delay: 0.1, text: "আমি CapCut Free চালাতাম তাই আমার edit তেমন ভালো  হতো না। এখন ক্রমবদ্ধ ভাবে কাজ করতে পারছি।" },
              { name: "আরিফ মাহমুদ", role: "ফ্রিল্যান্সার", initial: "আ", delay: 0.2, text: "৫ মিনিটে সেটআপ শেষ, 24/7 সাপোর্ট পাই — অবিশ্বাস্য! ক্লায়েন্টদের কাজ আরও দ্রুত করতে পারছি।" },
            ].map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </section>

        {/* ── COUNTDOWN + CTA ── */}
        <FadeUp className="mt-32">
          <div className="overflow-hidden rounded-[2.5rem] border border-red-500/25 bg-gradient-to-br from-zinc-950 via-red-950/20 to-zinc-950 p-8 text-center sm:p-16">
            {/* Animated glow */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[2.5rem]"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.15), transparent 70%)" }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-4 inline-block rounded-full bg-red-500/15 px-4 py-1.5 text-sm font-bold text-red-400 ring-1 ring-red-500/30"
              >
                🔥 Limited Time Offer
              </motion.div>

              <h2 className="text-4xl font-black text-white sm:text-5xl">এই অফার শেষ হচ্ছে</h2>
              <p className="mt-3 text-zinc-400">মূল্য যেকোনো সময় বাড়তে পারে — এখনই সিদ্ধান্ত নিন</p>

              {/* Countdown */}
              <div className="mt-8 flex items-center justify-center gap-4">
                {[
                  { label: "ঘণ্টা", val: countdown.h },
                  { label: "মিনিট", val: countdown.m },
                  { label: "সেকেন্ড", val: countdown.s },
                ].map((c, i) => (
                  <div key={c.label} className="flex items-center gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-3 text-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={c.val}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-3xl font-black text-white tabular-nums"
                        >
                          {String(c.val).padStart(2, "0")}
                        </motion.div>
                      </AnimatePresence>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{c.label}</div>
                    </div>
                    {i < 2 && <span className="text-2xl font-black text-red-500">:</span>}
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-3 text-left sm:mx-auto sm:max-w-sm">
                {[
  "Instant CapCut Project Setup",
  "Step-by-Step Viral Video Guide",
  "One-Click Asset Downloading",
  "Instant Setup Instructions",
  "Pro-Level Editing Workflows",
  "Direct Access to Support Resources",
  "Fast Rendering & Export Secrets",
  "Lifetime Update Access"
].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="text-green-400">✓</span> {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="text-zinc-500 line-through text-lg">৳১,৯৯০</span>
                <span className="text-5xl font-black text-white">৳১৯৯</span>
                <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">৯০% ছাড়</span>
              </div>

              <motion.div className="mt-6" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="group relative inline-flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-10 text-xl font-black text-white shadow-2xl shadow-red-900/50 sm:w-auto sm:min-w-[320px]"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                  />
                  <span className="relative z-10">এখনই এক্সেস নিন — ৳১৯৯ →</span>
                </Link>
              </motion.div>

              <p className="mt-4 text-xs text-zinc-500">✅ ৭ দিনের Money-back Guarantee · কোনো Hidden Charge নেই</p>
            </div>
          </div>
        </FadeUp>

        {/* ── MONEY BACK ── */}
        <FadeUp className="mt-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-green-500/20 bg-green-500/5 p-10 text-center sm:flex-row sm:text-left">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 text-4xl"
            >
              🛡️
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-white">১০০% Money-back Guarantee</h3>
              <p className="mt-2 text-zinc-400 max-w-xl">
                যদি আমাদের দেখানো মেথডটি আপনার সিস্টেমে কাজ না করে, তবে আমরা কোনো প্রশ্ন ছাড়াই আপনার টাকা ফেরত দেব।
                আপনার সাকসেস আমাদের প্রথম অগ্রাধিকার।
              </p>
            </div>
          </div>
        </FadeUp>

        {/* ── FAQ ── */}
        <section id="faq" className="mt-32 scroll-mt-28">
          <FadeUp>
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-red-500">FAQ</div>
            <h2 className="mb-10 text-center text-4xl font-black text-white">সচরাচর জিজ্ঞাসিত প্রশ্ন</h2>
          </FadeUp>

          <div className="mx-auto max-w-3xl space-y-3">
            {[
              { q: "মেথডটি কি আসলেই কাজ করবে?", a: "হ্যাঁ, এটি একটি লিগ্যাল রিসোর্স ম্যানেজমেন্ট টেকনিক। আমরা কোনো ক্র্যাক সফটওয়্যার দিচ্ছি না, বরং সিস্টেমের ভেতরে থাকা ক্যাশ ফাইল অপ্টিমাইজ করার পদ্ধতি শেখাচ্ছি।", delay: 0 },
              { q: "লাইফটাইম মানে কি সত্যিই সারাজীবন?", a: "হ্যাঁ! একবার কিনলে আর কোনো মাসিক বা বার্ষিক ফি লাগবে না। আপনি যতদিন ইচ্ছা ব্যবহার করতে পারবেন।", delay: 0.05 },
              { q: "রিফান্ড পলিসি কী?", a: <ul className="list-disc space-y-1 pl-5"><li>স্ক্রিনশট বা ছোট ভিডিও প্রমাণ হিসেবে দিতে হবে।</li><li>আমাদের সাপোর্ট টিম থেকে রিমোটলি হেল্প করার ট্রাই করা হবে।</li><li>সমাধান না হলে ৭ কার্যদিবসের মধ্যে রিফান্ড কার্যকর হবে।</li></ul>, delay: 0.1 },
              { q: "কোনো technical knowledge লাগবে?", a: "না! আমাদের ভিডিও টিউটোরিয়াল এতটাই সহজ যে একদম নতুনরাও সহজে করতে পারবে।", delay: 0.15 },
              { q: "পেমেন্ট কিভাবে করবো?", a: "বিকাশ, নগদ, রকেট এবং কার্ড পেমেন্ট সব গ্রহণ করা হয়।", delay: 0.2 },
              { q: "সেটআপ করতে কতদিন লাগে?", a: "মাত্র ৫-১০ মিনিট! পেমেন্ট করার পরপরই আপনি ভিডিও গাইড পাবেন এবং সঙ্গে সঙ্গে সেটআপ করতে পারবেন।", delay: 0.25 },
            ].map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} delay={f.delay} />
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <FadeUp className="mt-32 text-center">
          <h2 className="text-4xl font-black text-white sm:text-5xl">আর দেরি করবেন না</h2>
          <p className="mt-4 text-zinc-400">এই মূল্য যেকোনো সময় বাড়তে পারে। এখনই সিদ্ধান্ত নিন।</p>
          <div className="mt-6 flex justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-12 text-xl font-black text-white shadow-2xl shadow-red-900/50"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                />
                <span className="relative z-10">এখনই এক্সেস নিন — ৳১৯৯</span>
              </Link>
            </motion.div>
          </div>
          <p className="mt-4 text-xs text-zinc-600">কোনো hidden charge নেই · ৭ দিনের money-back · Instant access</p>
        </FadeUp>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/6 py-12 text-center">
        <p className="text-sm font-bold text-zinc-500">
          Powered by <span className="text-red-600">NodeCraft Agency</span>
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600">
          © {new Date().getFullYear()} · All Rights Reserved
        </p>
      </footer>

      <ExitIntentPopup />
    </div>
  );
}