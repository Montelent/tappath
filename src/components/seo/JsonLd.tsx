/** Safe JSON-LD script tag for structured data. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function siteBase(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
}
