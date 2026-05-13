import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { generateOtpDigits, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mail";
import { rateLimit, getClientIp } from "@/lib/ratelimit";

const bodySchema = z.object({
  email: z.string().email(),
  intent: z.enum(["login", "register"]),
  name: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
});

export async function POST(req: Request) {
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

  const { email, intent, name, website } = parsed.data;
  const normalized = email.toLowerCase().trim();

  // হানিপট ফিল্ড চেক
  if (website) {
    return Response.json({ ok: true, message: "কোড পাঠানো হয়েছে" });
  }

  // রেট লিমিট চেক
  const ip = getClientIp(req.headers);
  const rlIp = rateLimit(`otp_ip:${ip}`, 15, 60 * 60 * 1000);
  if (!rlIp.ok) {
    return Response.json(
      {
        error: "অনেক বেশি অনুরোধ। পরে চেষ্টা করুন।",
        retryAfter: rlIp.retryAfterSec,
      },
      { status: 429 },
    );
  }

  const rlEmail = rateLimit(`otp_em:${normalized}`, 5, 60 * 60 * 1000);
  if (!rlEmail.ok) {
    return Response.json(
      {
        error: "এই ইমেইলে অনেক বেশি কোড চাওয়া হয়েছে।",
        retryAfter: rlEmail.retryAfterSec,
      },
      { status: 429 },
    );
  }

  await connectDB();

  // রেজিস্ট্রেশন চেক
  if (intent === "register") {
    const exists = await User.findOne({ email: normalized });
    if (exists) {
      return Response.json(
        { error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।" },
        { status: 400 },
      );
    }
    if (!name?.trim()) {
      return Response.json({ error: "নাম লিখুন" }, { status: 400 });
    }
  }

  // লগইন চেক
  if (intent === "login") {
    const exists = await User.findOne({ email: normalized });
    if (!exists) {
      return Response.json({
        ok: true,
        message: "যদি অ্যাকাউন্ট থাকে, কোড ইমেইলে যাবে।",
      });
    }
  }

  // ওটিপি জেনারেশন এবং স্টোরেজ
  const code = generateOtpDigits();
  await OtpToken.deleteMany({ email: normalized });
  await OtpToken.create({
    email: normalized,
    codeHash: hashOtp(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    intent,
    name: intent === "register" ? name?.trim() : undefined,
    attempts: 0,
  });

  // ইমেইল পাঠানো (Nodemailer ব্যবহার করে)
  try {
    await sendOtpEmail(normalized, code);
  } catch (e) {
    console.error("ইমেইল এরর:", e);
    // ইমেইল না গেলে টোকেন ডিলিট করে দেওয়া হচ্ছে যাতে ইউজার আবার ট্রাই করতে পারে
    await OtpToken.deleteMany({ email: normalized });
    return Response.json(
      { error: "ইমেইল পাঠানো যায়নি। আপনার ইন্টারনেট বা কনফিগারেশন চেক করুন।" },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    message: "কোড ইমেইলে পাঠানো হয়েছে।",
  });
}
