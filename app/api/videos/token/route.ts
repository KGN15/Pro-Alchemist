import { z } from "zod";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";
import { signedVideoUrl } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/ratelimit";

const qSchema = z.object({
  id: z.string().min(1).max(64),
});

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "user" || !session.user.id) {
    return Response.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = qSchema.safeParse({ id: url.searchParams.get("id") });
  if (!parsed.success) {
    return Response.json({ error: "অবৈধ" }, { status: 400 });
  }

  const rl = rateLimit(`vwatch:${session.user.id}`, 120, 60 * 60 * 1000);
  if (!rl.ok) {
    return Response.json({ error: "লিমিট" }, { status: 429 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user || user.paymentStatus !== "approved") {
    return Response.json({ error: "প্রবেশ নেই" }, { status: 403 });
  }

  const video = await Video.findOne({
    _id: parsed.data.id,
    isActive: true,
  });

  if (!video) {
    return Response.json({ error: "ভিডিও নেই" }, { status: 404 });
  }

  // ১. ইউটিউব ভিডিওর জন্য চেক (এটি আগে দিন যদি ইউটিউব প্রায়োরিটি হয়)
  if (video.videoId) {
    return Response.json({
      type: "youtube", // ফ্রন্টএন্ডে চেনার জন্য টাইপ পাঠিয়ে দিন
      url: video.videoId, // ভিডিও আইডিটাই পাঠালাম
      title: video.title,
    });
  }

  // ২. ক্লাউডিনারি সাইনড ইউআরএল
  if (video.cloudinaryPublicId) {
    try {
      const watchUrl = signedVideoUrl(video.cloudinaryPublicId, 600);
      return Response.json({
        type: "cloudinary",
        url: watchUrl,
        title: video.title,
        expiresInSec: 600,
      });
    } catch (e) {
      console.error(e);
      return Response.json(
        { error: "ভিডিও লিঙ্ক তৈরি করা যায়নি।" },
        { status: 500 },
      );
    }
  }

  // ৩. ডিরেক্ট সিকিউর ইউআরএল (যদি থাকে)
  if (video.secureUrl) {
    return Response.json({
      type: "direct",
      url: video.secureUrl,
      title: video.title,
      expiresInSec: null,
    });
  }

  return Response.json({ error: "কোনো সোর্স নেই" }, { status: 400 });
}
