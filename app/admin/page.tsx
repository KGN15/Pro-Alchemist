"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string;
  paymentStatus: string;
  createdAt: string;
};

type PaymentRow = {
  id: string;
  status: string;
  bkashNumber: string;
  senderName: string;
  trxId: string;
  amountTaka: number;
  screenshotUrl: string;
  adminNote?: string;
  createdAt: string;
  user: { email?: string; name?: string } | null;
};

type VideoRow = {
  id: string;
  title: string;
  cloudinaryPublicId?: string;
  secureUrl?: string;
  videoId: string;
  sortOrder: number;
};

export default function AdminHomePage() {
  const [tab, setTab] = useState<"payments" | "users" | "videos">("payments");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    cloudinaryPublicId: "",
    secureUrl: "",
    videoId: "",
    sortOrder: "0",
  });

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [u, p, v] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/payments").then((r) => r.json()),
        fetch("/api/admin/videos").then((r) => r.json()),
      ]);
      if (u.users) setUsers(u.users);
      if (u.error) setErr(u.error);
      if (p.payments) setPayments(p.payments);
      if (v.videos) setVideos(v.videos);
    } catch {
      setErr("ডাটা লোড করা যায়নি");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updatePayment(
    id: string,
    status: "approved" | "rejected",
    adminNote?: string
  ) {
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote }),
    });
    if (!res.ok) {
      setErr("আপডেট ব্যর্থ");
      return;
    }
    await load();
  }

  async function addVideo(e: React.FormEvent, videoId: string) {
    e.preventDefault();
    const res = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: videoForm.title,

        cloudinaryPublicId: videoForm.cloudinaryPublicId || undefined,
        secureUrl: videoForm.secureUrl || undefined,
        videoId: videoId || undefined,
        sortOrder: Number(videoForm.sortOrder) || 0,
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || "ভিডিও যোগ করা যায়নি");
      return;
    }
    setVideoForm({ title: "", cloudinaryPublicId: "", secureUrl: "", videoId: "", sortOrder: "0" });
    await load();
  }

  async function removeVideo(id: string) {
    if (!confirm("ভিডিও মুছবেন?")) return;
    await fetch(`/api/admin/videos?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  }

  return (
   <div className="min-h-screen bg-[#090412] text-zinc-100 font-sans selection:bg-red-500/30">
      {/* Header Section */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/60 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">
            Pro <span className="text-red-600">Alchemist</span> Admin
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/10 hover:text-white border border-white/10"
            onClick={() => load()}
          >
            🔄 রিফ্রেশ
          </button>
          <button
            type="button"
            className="rounded-full bg-red-600/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 transition-all hover:bg-red-600 hover:text-white border border-red-600/20"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            লগআউট
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Navigation Tabs */}
        <div className="inline-flex rounded-2xl bg-white/5 p-1.5 border border-white/5 backdrop-blur-md">
          {(
            [
              ["payments", "পেমেন্ট রিকোয়েস্ট"],
              ["users", "ইউজার"],
              ["videos", "ভিডিও ম্যানেজমেন্ট"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                tab === k
                  ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {err && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
            <span>⚠️</span> {err}
          </div>
        )}

        {/* Tab Content: Users */}
        {tab === "users" && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                <tr>
                  <th className="px-6 py-4">নাম</th>
                  <th className="px-6 py-4">ইমেইল</th>
                  <th className="px-6 py-4">স্ট্যাটাস</th>
                  <th className="px-6 py-4">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                        u.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {u.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Payments */}
        {tab === "payments" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-red-600/30 hover:bg-white/[0.05]"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold">
                      {p.user?.name?.[0] || 'U'}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-red-500 bg-red-500/10 px-2 py-1 rounded">
                      {p.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-white leading-tight">{p.user?.name}</h3>
                    <p className="text-xs text-zinc-500 truncate">{p.user?.email}</p>
                  </div>

                  <div className="space-y-1.5 rounded-xl bg-black/40 p-3 text-xs border border-white/5">
                    <p className="flex justify-between"><span className="text-zinc-500">পরিমাণ:</span> <span className="text-white font-bold">৳{p.amountTaka}</span></p>
                    <p className="flex justify-between"><span className="text-zinc-500">TrxID:</span> <span className="text-red-400 font-mono">{p.trxId}</span></p>
                    <p className="flex justify-between"><span className="text-zinc-500">বিকাশ:</span> <span className="text-white">{p.bkashNumber}</span></p>
                  </div>

                  {p.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => updatePayment(p.id, "approved")}
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold uppercase text-white hover:bg-emerald-500 transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updatePayment(p.id, "rejected")}
                        className="flex-1 rounded-xl bg-white/5 py-2.5 text-xs font-bold uppercase text-zinc-400 hover:bg-red-600/20 hover:text-red-500 transition-all border border-white/10"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  <a
                    href={p.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    View Screenshot ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Videos */}
        {tab === "videos" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Extract ID from URL if user pastes full link
                  const url = videoForm.videoId || "";
                  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                  const match = url.match(regExp);
                  const actualId = (match && match[1].length === 11) ? match[1] : url;
                  
                  // call original addVideo with cleaned ID
                  addVideo(e, actualId);
                }}
                className="sticky top-28 space-y-5 rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm"
              >
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">নতুন ভিডিও যোগ করুন</h2>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ভিডিও শিরোনাম</label>
                    <input
                      required
                      placeholder="যেমন: ১. এনভায়রনমেন্ট সেটআপ"
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
                      value={videoForm.title || ""}
                      onChange={(e) => setVideoForm((s) => ({ ...s, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">YouTube Video URL</label>
                    <input
                      required
                      placeholder="লিঙ্ক পেস্ট করুন..."
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-red-600/50 focus:outline-none transition-all font-mono"
                      value={videoForm.videoId || ""}
                      onChange={(e) => setVideoForm((s) => ({ ...s, videoId: e.target.value }))}
                    />
                    <p className="text-[9px] text-zinc-600 mt-1 italic">সরাসরি ব্রাউজারের লিঙ্কটি এখানে পেস্ট করুন</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">সর্টিং অর্ডার</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-red-600/50 focus:outline-none transition-all"
                      value={videoForm.sortOrder || "0"}
                      onChange={(e) => setVideoForm((s) => ({ ...s, sortOrder: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  লাইব্রেরিতে যোগ করুন
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest px-2">ভিডিও লাইব্রেরি ({videos.length})</h2>
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-20 overflow-hidden rounded-lg bg-black border border-white/5">
                        <Image 
                            src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} 
                            alt="thumb" 
                            className="h-full w-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                            {v.sortOrder}
                        </div>
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">{v.title}</p>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                        YT ID: {v.videoId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                        href={`https://youtu.be/${v.videoId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-white/5 transition-all"
                    >
                        ↗
                    </a>
                    <button
                        type="button"
                        className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-red-600/20 hover:text-red-500 transition-all"
                        onClick={() => removeVideo(v.id)}
                    >
                        ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
