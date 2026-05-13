import { auth } from "@/auth";
import { getCloudinary } from "@/lib/cloudinary";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
  }

  const ip = getClientIp(req.headers);
  const rl = rateLimit(`upload:${ip}`, 30, 60 * 60 * 1000);
  if (!rl.ok) {
    return Response.json({ error: "অনেক বেশি আপলোড" }, { status: 429 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "ফাইল নেই" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "শুধু ইমেজ" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "সর্বোচ্চ ৫MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString("base64");
  const dataUri = `data:${file.type};base64,${b64}`;

  const c = getCloudinary();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "capcut-proofs";

  const result = await c.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
  });

  return Response.json({
    url: result.secure_url as string,
    publicId: result.public_id as string,
  });
}
