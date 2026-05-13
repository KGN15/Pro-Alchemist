"use client";

import { useEffect, useState } from "react";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";

type VideoItem = {
  id: string;
  title: string;
  description?: string;
  videoId: string;
};

export function DashboardVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/videos", { credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) {
          setErr(data.error || "লোড করা যায়নি");
          return;
        }
        setVideos(data.videos || []);
      } catch {
        setErr("নেটওয়ার্ক ত্রুটি");
      }
    })();
  }, []);

  if (err) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
        {err}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-400">
        এখনও কোনো ভিডিও যোগ করা হয়নি। অ্যাডমিন কন্টেন্ট আপলোড করলে এখানে দেখা যাবে।
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-bold text-white">ভিডিও টিউটোরিয়াল</h2>
      {videos.map((v) => (
        <section key={v.id} className="space-y-3">
          {v.description && (
            <p className="text-sm text-zinc-400">{v.description}</p>
          )}
          <SecureVideoPlayer videoId={v.videoId} title={v.title} />
        </section>
      ))}
    </div>
  );
}
