import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { hashOtp } from "@/lib/otp";

const MAX_OTP_ATTEMPTS = 8;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // ৭ দিন সেশন
  },
  providers: [
    // অ্যাডমিন লগইন
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

        if (email.toLowerCase().trim() === adminEmail && password === adminPass) {
          return { id: "admin", email, name: "Admin", role: "admin" };
        }
        return null;
      },
    }),

    // ইউজার ওটিপি লগইন/রেজিস্ট্রেশন
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

        // ১. লেটেস্ট ওটিপি খুঁজে বের করা (যেটা এখনো ব্যবহৃত হয়নি)
        const doc = await OtpToken.findOne({ 
          email, 
          used: { $ne: true } 
        }).sort({ createdAt: -1 });

        // ভ্যালিডেশন চেক
        if (!doc || doc.expiresAt < new Date() || doc.attempts >= MAX_OTP_ATTEMPTS) {
          return null;
        }

        // ২. ওটিপি ভেরিফাই (ইনপুট হ্যাশ ম্যাচিং)
        const hashedInput = hashOtp(code);
        if (hashedInput !== doc.codeHash) {
          await OtpToken.updateOne({ _id: doc._id }, { $inc: { attempts: 1 } });
          return null;
        }

        // ৩. ইউজার হ্যান্ডলিং
        let user = await User.findOne({ email });

        if (doc.intent === "register") {
          if (!user) {
            user = await User.create({
              email,
              name: doc.name || email.split("@")[0],
              role: "user",
              paymentStatus: "none",
            });
          }
        } else if (doc.intent === "login") {
          if (!user) return null; // ইউজার না থাকলে লগইন হবে না
        }

        // ৪. ওটিপি ডিলিট না করে ব্যবহৃত মার্ক করা (যাতে সেশন রিকোয়েস্ট ফেইল না হয়)
        if (user) {
          // এটাকে আপডেট করা সেফ, কারণ এতে সেশন ক্রিয়েশনের সময় ডেটা হারায় না
          await OtpToken.updateOne({ _id: doc._id }, { $set: { used: true } });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || "user", // ইউজার রোল এনশিওর করা
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || "";
        (session.user as any).role = (token.role as string) || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});