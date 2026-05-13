import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OtpToken from "@/models/OtpToken";
import { verifyOtpHash } from "@/lib/otp";

const MAX_OTP_ATTEMPTS = 8;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
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
        if (
          email.toLowerCase().trim() ===
            (process.env.ADMIN_EMAIL || "").toLowerCase().trim() &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            email,
            name: "Admin",
            role: "admin" as const,
          };
        }
        return null;
      },
    }),
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
        if (!email || !code || code.length < 4) return null;

        await connectDB();
        const doc = await OtpToken.findOne({ email }).sort({ createdAt: -1 });
        if (!doc || doc.expiresAt < new Date()) return null;
        if (doc.attempts >= MAX_OTP_ATTEMPTS) return null;
        if (!verifyOtpHash(code, doc.codeHash)) {
          await OtpToken.updateOne(
            { _id: doc._id },
            { $inc: { attempts: 1 } }
          );
          return null;
        }

        let user = await User.findOne({ email });
        if (doc.intent === "register") {
          if (!user) {
            user = await User.create({
              email,
              name: doc.name || email.split("@")[0],
              paymentStatus: "none",
            });
          }
        } else if (doc.intent === "login") {
          if (!user) return null;
        }

        await OtpToken.deleteMany({ email });

        if (!user) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: "user" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) || "";
        session.user.role = (token.role as "user" | "admin") || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
