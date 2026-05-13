import { z } from "zod";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Video from "@/models/Video";

// ১. স্কিমাতে videoId যোগ করা হয়েছে
const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  videoId: z.string().max(100).optional(), // YouTube ID-র জন্য
  cloudinaryPublicId: z.string().max(500).optional(),
  secureUrl: z.string().url().optional(),
  sortOrder: z.coerce.number().optional(),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const list = await Video.find().sort({ sortOrder: 1 }).lean();

  return Response.json({
    videos: list.map((v) => ({
      id: v._id.toString(),
      title: v.title,
      description: v.description,
      videoId: v.videoId, // ডাটাবেস থেকে পাঠানো হচ্ছে
      cloudinaryPublicId: v.cloudinaryPublicId,
      secureUrl: v.secureUrl,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "তথ্য সঠিক নয়" }, { status: 400 });
  }

  // ২. লজিক আপডেট: videoId চেক করা হচ্ছে
  const { videoId, cloudinaryPublicId, secureUrl } = parsed.data;

  if (!videoId && !cloudinaryPublicId && !secureUrl) {
    return Response.json(
      { error: "videoId, cloudinaryPublicId অথবা secureUrl দিন" },
      { status: 400 },
    );
  }

  await connectDB();
  const v = await Video.create({
    title: parsed.data.title.trim(),
    description: parsed.data.description?.trim(),
    videoId: videoId?.trim(), // এখানে সেভ হচ্ছে
    cloudinaryPublicId: cloudinaryPublicId?.trim(),
    secureUrl: secureUrl?.trim(),
    sortOrder: parsed.data.sortOrder ?? 0,
    isActive: true,
  });

  return Response.json({ id: v._id.toString() });
}

const delSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const parsed = delSchema.safeParse({ id: url.searchParams.get("id") });
  if (!parsed.success) {
    return Response.json({ error: "id লাগবে" }, { status: 400 });
  }

  await connectDB();
  await Video.findByIdAndDelete(parsed.data.id);
  return Response.json({ ok: true });
}
