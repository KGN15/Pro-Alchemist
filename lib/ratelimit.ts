type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune() {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

/** Sliding window rate limit. Returns { ok, retryAfterSec } */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  prune();
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 1, resetAt: now + windowMs };
    buckets.set(key, b);
    return { ok: true };
  }
  if (b.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
    };
  }
  b.count += 1;
  return { ok: true };
}

export function getClientIp(headers: Headers): string {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") || "unknown";
}
