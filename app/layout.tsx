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
  title: "ক্যাপকাট প্রো মেথড — লাইফটাইম অ্যাক্সেস",
  description:
    "ডিজিটাল মেথড, ভিডিও টিউটোরিয়াল ও সাপোর্ট — সীমিত সময়ের অফার।",
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
