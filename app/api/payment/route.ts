import { z } from "zod";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PaymentRequest from "@/models/PaymentRequest";

const bodySchema = z.object({
  bkashNumber: z.string().min(10).max(20),
  senderName: z.string().min(2).max(120),
  trxId: z.string().min(4).max(80),
  amountTaka: z.coerce.number().min(1).max(1000000),
  screenshotUrl: z.string().url(),
  screenshotPublicId: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "user" || !session.user.id) {
    return Response.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "অবৈধ অনুরোধ" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "তথ্য সঠিক নয়" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return Response.json({ error: "ইউজার নেই" }, { status: 404 });
  }

  if (user.paymentStatus === "approved") {
    return Response.json({ error: "ইতিমধ্যে ভেরিফাইড" }, { status: 400 });
  }

  const pending = await PaymentRequest.findOne({
    userId: user._id,
    status: "pending",
  });
  if (pending) {
    return Response.json(
      { error: "আপনার একটি পেন্ডিং রিকোয়েস্ট আছে" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  await PaymentRequest.create({
    userId: user._id,
    bkashNumber: d.bkashNumber.trim(),
    senderName: d.senderName.trim(),
    trxId: d.trxId.trim(),
    amountTaka: d.amountTaka,
    screenshotUrl: d.screenshotUrl,
    screenshotPublicId: d.screenshotPublicId,
    status: "pending",
  });

  user.paymentStatus = "pending";
  await user.save();

  return Response.json({ ok: true });
}
