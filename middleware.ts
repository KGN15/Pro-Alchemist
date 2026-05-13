import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const token = await getToken({ req, secret });

  const path = req.nextUrl.pathname;
  const role = token?.role as string | undefined;

  // ১. ইউজার যদি লগইন থাকা অবস্থায় হোম পেজ (/), লগইন পেজ বা রেজিস্টার পেজে যায়
  const authPaths = ["/", "/login", "/register"];
  if (authPaths.includes(path)) {
    if (token) {
      // রোল অনুযায়ী সঠিক ড্যাশবোর্ডে পাঠাবে
      const redirectUrl = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // ২. এডমিন প্যানেল প্রটেকশন
  if (path.startsWith("/admin")) {
    // এডমিন লগইন পেজের জন্য স্পেশাল চেক
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
      // এডমিনও চাইলে ড্যাশবোর্ড দেখতে পারে, না চাইলে শুধু 'user' দিন
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// ৪. গুরুত্বপূর্ণ: ম্যাচার আপডেট
export const config = {
  /*
   * নিচের পাথগুলো বাদে সব পাথে মিডলওয়্যার রান হবে:
   * api (API routes)
   * _next/static (static files)
   * _next/image (image optimization files)
   * favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
