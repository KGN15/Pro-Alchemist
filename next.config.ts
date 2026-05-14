import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            // এখানে style-src এবং script-src এ 'unsafe-inline' যোগ করা হয়েছে
            // এবং img-src এ data: যোগ করা হয়েছে SVG এর জন্য
            // Content-Security-Policy এর value হিসেবে এটি ব্যবহার করুন
value: "default-src 'self'; " +
       "img-src 'self' data: https://img.youtube.com; " +
       "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; " + // ইউটিউব স্ক্রিপ্ট এলাও করা হয়েছে
       "style-src 'self' 'unsafe-inline'; " +
       "font-src 'self' data:; " +
       "connect-src 'self' https://proalchemist.qzz.io; " +
       "frame-src 'self' https://www.youtube.com; " + // ইউটিউব ভিডিও আইফ্রেম এলাও করা হয়েছে
       "frame-ancestors 'none';"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
