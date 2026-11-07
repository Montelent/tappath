import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

let tableReady: Promise<void> | null = null;
let lastCleanup = 0;

async function ensureRateLimitTable() {
  const sql = getSql();
  if (!sql) throw new Error("Rate-limit database unavailable.");
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS api_rate_limits (
        bucket text NOT NULL,
        window_start timestamptz NOT NULL,
        hits integer NOT NULL DEFAULT 0,
        PRIMARY KEY (bucket, window_start)
      )
    `.then(() => undefined).catch((error) => {
      tableReady = null;
      throw error;
    });
  }
  await tableReady;
}

export async function enforceRateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number; unavailable?: boolean }> {
  if (!isNeonConfigured()) {
    return process.env.NODE_ENV === "production"
      ? { allowed: false, retryAfter: windowSeconds, unavailable: true }
      : { allowed: true, retryAfter: windowSeconds };
  }

  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "tappath-dev-rate-limit";
  const fingerprint = createHash("sha256").update(`${secret}:${ip}`).digest("hex");
  const bucket = `${scope}:${fingerprint}`;
  const windowMs = Math.max(1, windowSeconds) * 1000;
  const start = Math.floor(Date.now() / windowMs) * windowMs;
  const retryAfter = Math.max(1, Math.ceil((start + windowMs - Date.now()) / 1000));

  try {
    await ensureRateLimitTable();
    const sql = getSql()!;
    const rows = await sql`
      INSERT INTO api_rate_limits (bucket, window_start, hits)
      VALUES (${bucket}, ${new Date(start).toISOString()}, 1)
      ON CONFLICT (bucket, window_start)
      DO UPDATE SET hits = api_rate_limits.hits + 1
      WHERE api_rate_limits.hits < ${Math.max(1, limit)}
      RETURNING hits
    `;

    if (Date.now() - lastCleanup > 60 * 60 * 1000) {
      lastCleanup = Date.now();
      await sql`DELETE FROM api_rate_limits WHERE window_start < now() - interval '7 days'`.catch(() => []);
    }

    return { allowed: rows.length > 0, retryAfter };
  } catch (error) {
    console.error("[rate-limit]", error);
    return process.env.NODE_ENV === "production"
      ? { allowed: false, retryAfter, unavailable: true }
      : { allowed: true, retryAfter };
  }
}
