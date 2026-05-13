import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { SignOutButton } from "@/components/SignOutButton";
import { DashboardVideos } from "./videos-client";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "user") {
    redirect("/login");
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    redirect("/login");
  }

  const status = user.paymentStatus;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-red-500/30">
  {/* Header Section */}
  <header className="relative z-20 border-b border-white/5 bg-black/40 px-6 py-6 backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full border border-red-500/30 bg-gradient-to-br from-red-600 to-red-900 p-[2px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-black font-black text-red-500">
            {user.name.charAt(0)}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Dashboard</p>
          <p className="font-bold text-white tracking-tight">{user.name}</p>
          <p className="text-xs text-zinc-500">{user.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/payment"
          className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold transition-all hover:bg-white/10 sm:block"
        >
          পেমেন্ট স্ট্যাটাস
        </Link>
        <SignOutButton />
      </div>
    </div>
  </header>

  <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
    {/* Background Glow */}
    <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[300px] w-full -translate-x-1/2 bg-red-900/5 blur-[100px]" />

    {status === "none" || status === "rejected" ? (
      <div className="relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-950/20 to-black/40 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-900/40">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m-3-4l1.39-1.39a2 2 0 012.82 0L12 11l1.79-1.79a2 2 0 012.82 0L18 10.61M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {status === "rejected" ? "পেমেন্ট প্রত্যাখ্যাত হয়েছে" : "ফুল এক্সেস আনলক করুন"}
          </h2>
          
          <p className="mt-4 text-lg leading-relaxed text-zinc-400">
            ক্যাপকাট প্রো-এর সেই সিক্রেট মেথড এবং ভিডিও গাইডগুলো দেখতে আপনার পেমেন্ট ভেরিফাই করা প্রয়োজন। 
            একবার ১৯৯৳ পেমেন্ট করে আজীবনের জন্য কন্টেন্ট আনলক করুন।
          </p>

          <Link
            href="/dashboard/payment"
            className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-red-700 active:scale-95"
          >
            পেমেন্ট জমা দিন
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        {/* Decorative element */}
        <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
      </div>

    ) : status === "pending" ? (
      <div className="rounded-[2rem] border border-white/5 bg-white/5 p-8 sm:p-12 text-center backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 ring-4 ring-red-500/20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500/20 border-t-red-600" />
        </div>
        
        <h2 className="text-2xl font-black text-white sm:text-3xl">পেমেন্ট রিভিউতে আছে</h2>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">
          ধৈর্য ধরুন ভাই! আমাদের টিম আপনার তথ্য যাচাই করছে। অনুমোদিত হওয়ার সাথে সাথে আপনার সিক্রেট ভিডিও গাইড এখানে চলে আসবে।
              </p>
              <p>যদি এপরুভ না হয় তাহলে +০১৯৯৬৫২৫৩৪২ নম্বরে যোগাযোগ করুন</p>
        
        <div className="mt-8 inline-block rounded-full bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Status: Pending Verification
        </div>
      </div>

    ) : (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white">আপনার জন্য ভিডিওগুলো</h2>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-500 ring-1 ring-inset ring-green-500/20">
              Unlocked Access
            </span>
        </div>
        <DashboardVideos />
      </div>
    )}
  </main>

  <footer className="mt-20 border-t border-white/5 py-10 text-center">
     <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600">
       NodeCraft Agency · Premium Digital Products
     </p>
  </footer>
</div>
  );
}
