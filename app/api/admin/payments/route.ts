import { z } from "zod";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import PaymentRequest from "@/models/PaymentRequest";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const rows = await PaymentRequest.find()
    .sort({ createdAt: -1 })
    .limit(300)
    .populate("userId", "email name")
    .lean();

  return Response.json({
    payments: rows.map((p) => ({
      id: p._id.toString(),
      status: p.status,
      bkashNumber: p.bkashNumber,
      senderName: p.senderName,
      trxId: p.trxId,
      amountTaka: p.amountTaka,
      screenshotUrl: p.screenshotUrl,
      adminNote: p.adminNote,
      createdAt: p.createdAt,
      user: p.userId
        ? {
            email: (p.userId as { email?: string }).email,
            name: (p.userId as { name?: string }).name,
          }
        : null,
    })),
  });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  adminNote: z.string().max(500).optional(),
});

export async function PATCH(req: Request) {
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

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  await connectDB();
  const pay = await PaymentRequest.findById(parsed.data.id);
  if (!pay) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  pay.status = parsed.data.status;
  if (parsed.data.adminNote !== undefined) {
    pay.adminNote = parsed.data.adminNote;
  }
  await pay.save();

  const user = await User.findById(pay.userId);
  if (user) {
    if (parsed.data.status === "approved") {
      user.paymentStatus = "approved";
    } else {
      user.paymentStatus = "rejected";
    }
    await user.save();
  }

  return Response.json({ ok: true });
}
