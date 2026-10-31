import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

type DeviceItem = {
  name: string;
  slug?: string;
  href?: string;
  brand?: string;
  os?: string;
};

type Props = {
  devices: DeviceItem[];
};

export default function DeviceJsonLd({ devices }: Props) {
  const base = siteBase();
  const path = "/devices";
  const url = `${base}${path}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Smartphone models & specs",
    description:
      "Device directory — search and filter smartphone models with guides, OS versions and specs.",
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: devices.length,
      itemListElement: devices.slice(0, 100).map((d, i) => {
        const itemUrl =
          d.href?.startsWith("http")
            ? d.href
            : d.href
              ? `${base}${d.href}`
              : d.slug
                ? `${base}/devices/${d.slug}`
                : url;
        return {
          "@type": "ListItem",
          position: i + 1,
          name: d.name,
          url: itemUrl,
          item: {
            "@type": "Product",
            name: d.name,
            ...(d.brand ? { brand: { "@type": "Brand", name: d.brand } } : {}),
            ...(d.os
              ? {
                  additionalProperty: {
                    "@type": "PropertyValue",
                    name: "Operating system",
                    value: d.os,
                  },
                }
              : {}),
          },
        };
      }),
    },
  };

  return (
    <>
      <JsonLd data={data} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Devices", path },
        ]}
      />
    </>
  );
}
