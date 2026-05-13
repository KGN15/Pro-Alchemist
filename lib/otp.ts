import { createHash, randomInt, timingSafeEqual } from "crypto";

const PEPPER = () => process.env.OTP_PEPPER || process.env.AUTH_SECRET || "change-me";

export function generateOtpDigits(length = 6): string {
  const max = 10 ** length;
  const n = randomInt(0, max);
  return n.toString().padStart(length, "0");
}

export function hashOtp(code: string): string {
  return createHash("sha256")
    .update(`${code}:${PEPPER()}`)
    .digest("hex");
}

export function verifyOtpHash(code: string, hash: string): boolean {
  const a = Buffer.from(hashOtp(code), "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
