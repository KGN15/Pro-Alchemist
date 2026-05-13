import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Video from "@/models/Video";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "user" || !session.user.id) {
    return Response.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user || user.paymentStatus !== "approved") {
    return Response.json({ error: "পেমেন্ট ভেরিফাইড নয়" }, { status: 403 });
  }

  const list = await Video.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  return Response.json({
    videos: list.map((v) => ({
      id: v._id.toString(),
      title: v.title,
      videoId: v.videoId,
      description: v.description ?? undefined,
      hasCloudinary: Boolean(v.cloudinaryPublicId),
      hasExternalUrl: Boolean(v.secureUrl),
    })),
  });
}
