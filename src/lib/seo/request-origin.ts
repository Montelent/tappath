import { headers } from "next/headers";

function normalizeOrigin(value: string | undefined | null): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(
      candidate.startsWith("http://") || candidate.startsWith("https://")
        ? candidate
        : `https://${candidate}`,
    );
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname ||
      url.username ||
      url.password
    ) return null;

    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Resolve the canonical public origin for SEO files.
 * Explicit SEO canonical host wins; otherwise use the exact incoming hostname.
 * No project/domain URL is embedded in the application.
 */
export async function getRequestOrigin(canonicalHost?: string | null): Promise<string> {
  const canonicalOrigin = normalizeOrigin(canonicalHost);
  if (canonicalOrigin) return canonicalOrigin;

  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const directHost = requestHeaders.get("host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || directHost;

  if (!requestHost) {
    const deploymentOrigin = normalizeOrigin(
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    );
    if (deploymentOrigin) return deploymentOrigin;

    throw new Error("Unable to determine the request hostname for SEO metadata.");
  }

  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const requestProto =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : process.env.NODE_ENV === "development"
        ? "http"
        : "https";

  const origin = normalizeOrigin(`${requestProto}://${requestHost}`);
  if (!origin) throw new Error("The incoming request hostname is invalid.");
  return origin;
}
