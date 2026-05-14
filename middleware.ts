import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;

  // ফিক্সড: getToken-এর ভেতরে secureCookie কি (key) ব্যবহার করতে হবে
  const token = await getToken({
    req,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const path = req.nextUrl.pathname;
  const role = token?.role as string | undefined;

  // ১. ইউজার যদি লগইন থাকা অবস্থায় হোম পেজ (/), লগইন পেজ বা রেজিস্টার পেজে যায়
  const authPaths = ["/", "/login", "/register"];
  if (authPaths.includes(path)) {
    if (token) {
      // রোল অনুযায়ী সঠিক ড্যাশবোর্ডে পাঠাবে
      const redirectUrl = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // ২. এডমিন প্যানেল প্রটেকশন
  if (path.startsWith("/admin")) {
    if (path === "/admin/login") {
      if (role === "admin")
        return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.next();
    }

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ৩. ইউজার ড্যাশবোর্ড প্রটেকশন
  if (path.startsWith("/dashboard")) {
    if (role !== "user" && role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
