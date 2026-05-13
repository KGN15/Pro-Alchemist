import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { hashOtp } from "@/lib/otp"; // সরাসরি hashOtp ইমপোর্ট করুন

const MAX_OTP_ATTEMPTS = 8;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // ৭ দিন সেশন থাকবে
  },
  providers: [
    // অ্যাডমিন লগইন (ইমেইল-পাসওয়ার্ড)
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
        const adminPass = process.env.ADMIN_PASSWORD;

        if (
          email.toLowerCase().trim() === adminEmail &&
          password === adminPass
        ) {
          return {
            id: "admin",
            email,
            name: "Admin",
            role: "admin",
          };
        }
        return null;
      },
    }),

    // ইউজার লগইন/রেজিস্ট্রেশন (ওটিপি)
    Credentials({
      id: "user-otp",
      name: "User OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.toLowerCase().trim();
        const code = (credentials?.code as string)?.trim();

        if (!email || !code) return null;

        await connectDB();

        // ১. লেটেস্ট ওটিপি খুঁজে বের করা
        const doc = await OtpToken.findOne({ email }).sort({ createdAt: -1 });

        // চেক: ওটিপি আছে কি না, মেয়াদ আছে কি না, বা বেশিবার ট্রাই করা হয়েছে কি না
        if (
          !doc ||
          doc.expiresAt < new Date() ||
          doc.attempts >= MAX_OTP_ATTEMPTS
        ) {
          return null;
        }

        // ২. ওটিপি ভেরিফাই করা (ইনপুট কোডকে হ্যাশ করে ডাটাবেজের codeHash এর সাথে ম্যাচ করা)
        const hashedInput = hashOtp(code);
        if (hashedInput !== doc.codeHash) {
          await OtpToken.updateOne({ _id: doc._id }, { $inc: { attempts: 1 } });
          return null; // কোড না মিললে এখান থেকেই রিটার্ন
        }

        // ৩. ইউজার হ্যান্ডলিং
        let user = await User.findOne({ email });

        if (doc.intent === "register") {
          if (!user) {
            user = await User.create({
              email,
              name: doc.name || email.split("@")[0],
              role: "user", // নিশ্চিত করুন রোল সেট হচ্ছে
              paymentStatus: "none",
            });
          }
        } else if (doc.intent === "login") {
          if (!user) return null; // অ্যাকাউন্ট না থাকলে লগইন হবে না
        }

        // ৪. কাজ শেষ হলে ওটিপি ক্লিন করা
        await OtpToken.deleteMany({ email });

        if (!user) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = (token.role as string) || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
