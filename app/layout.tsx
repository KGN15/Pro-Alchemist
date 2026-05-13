import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-bengali",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pro Alchemist ক্যাপকাট প্রো লিগ্যাল মেথড — লাইফটাইম অ্যাক্সেস |",
  description:
    "মাসে মাসে সাবস্ক্রিপশন ফি দেওয়া বন্ধ করুন। কোনো ক্র্যাক বা ভাইরাস ছাড়াই নিজের পার্সোনাল পিসিতে ক্যাপকাট প্রো ফিচার ব্যবহারের ১০০% লিগ্যাল মেথড। এখনই জয়েন করুন ৯৯.৯% আপটাইম গ্যারান্টি ও লাইফটাইম সাপোর্ট সহ।",
  keywords: [
    "CapCut Pro Method Bangladesh",
    "CapCut Pro Lifetime Access",
    "Video Editing Course Bangla",
    "CapCut Export Problem Solution",
    "Pro Alchemist CapCut",
    "Legal CapCut Pro Secret",
  ],
  authors: [{ name: "Mashhudur Rahman", url: "https://mashhudurrahman.qzz.io" }],
  openGraph: {
    title: "ক্যাপকাট প্রো — মাসে মাসে ২০০৳ নষ্ট করা বন্ধ করুন!",
    description: "নিজের আইডিতে ক্যাপকাট প্রো ফিচার ব্যবহার করার সিক্রেট মেথড। ১০০% নিরাপদ ও ভাইরাস মুক্ত।",
    url: "https://proalchemist.qzz.io", // এখানে আপনার আসল ডোমেইন দিন
    siteName: "Pro Alchemist",
    images: [
      {
        url: "/og-image.png", // আপনার পাবলিক ফোল্ডারে একটি সুন্দর প্রিভিউ ইমেজ রাখুন
        width: 1200,
        height: 630,
        alt: "Pro Alchemist CapCut Method",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CapCut Pro Lifetime Method — Pro Alchemist",
    description: "১০০% লিগ্যাল মেথডে ক্যাপকাট প্রো ফিচার আনলক করুন। আজীবন এক্সেস মাত্র ১৯৯ টাকায়!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${notoBengali.variable} h-full antialiased`}>
      <body cz-shortcut-listen="true" className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
