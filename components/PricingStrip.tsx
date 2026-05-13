"use client";

import { useEffect, useState } from "react";

/** ল্যান্ডিং এ FOMO — লোকাল স্টোরেজে একবার সিট সংখ্যা ফিক্স করে রাখা */
export function PricingStrip() {
  const [seats, setSeats] = useState<number | null>(null);

  useEffect(() => {
    const key = "pricing_seats_left_v1";
    const existing = localStorage.getItem(key);
    if (existing) {
      setSeats(Number(existing));
      return;
    }
    const n = 8 + Math.floor(Math.random() * 9);
    localStorage.setItem(key, String(n));
    setSeats(n);
  }, []);

  return (
    <p className="text-center text-sm text-amber-200/95">
      প্রথম{" "}
      <span className="font-semibold text-white">১০০ জনের জন্য ৳৯৯</span> · এরপর{" "}
      <span className="text-zinc-300">৳১৯৯</span>
      {seats !== null && (
        <>
          {" "}
          · আনুমানিক বাকি সিট:{" "}
          <span className="font-mono font-semibold text-amber-300">{seats}</span>
        </>
      )}
    </p>
  );
}
