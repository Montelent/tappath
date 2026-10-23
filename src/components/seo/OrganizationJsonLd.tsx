export default function OrganizationJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";

  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TapPath",
    url: base,
    description:
      "Visual step-by-step smartphone settings guides with interactive Live Simulator. Verified menu paths for Samsung, Xiaomi, Huawei, OnePlus, Oppo, Realme and more.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/devices?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "TapPath",
      url: base,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
