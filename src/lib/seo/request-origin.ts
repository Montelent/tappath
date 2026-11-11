import { headers } from "next/headers";

/**
 * Resolve the public origin for the current request.
 *
 * Prefer the incoming host so sitemap.xml and robots.txt always describe the
 * exact hostname on which they were requested (custom domain, www, or Vercel).
 * Only use deployment/environment values when no request host is available.
 */
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();

  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const directHost = requestHeaders.get("host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || directHost;

  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestProto =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : process.env.NODE_ENV === "development"
        ? "http"
        : "https";

  const candidates = [
    requestHost ? `${requestProto}://${requestHost}` : "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.NEXT_PUBLIC_SITE_URL || "",
    "http://localhost:3000",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(
        candidate.startsWith("http://") || candidate.startsWith("https://")
          ? candidate
          : `https://${candidate}`,
      );
      // Reject malformed host values and anything containing credentials.
      if (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.hostname &&
        !url.username &&
        !url.password
      ) {
        return url.origin;
      }
    } catch {
      // Try the next trusted deployment/configuration fallback.
    }
  }

  return "https://localhost:3000";
}
