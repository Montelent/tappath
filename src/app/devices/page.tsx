export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import DevicesDirectory from "@/components/devices/DevicesDirectory";
import { listDevicesPublic, deviceBrandFilters } from "@/lib/devices/resolve";
import DeviceJsonLd from "@/components/seo/DeviceJsonLd";

export const metadata: Metadata = {
  title: "All smartphone models & specs",
  description:
    "Device directory — search and filter smartphone models with guides, OS versions and specs.",
};

export default async function DevicesPage() {
  const devices = await listDevicesPublic();
  const brands = [{ slug: "all", name: "All" }, ...deviceBrandFilters(devices)];
  return (
    <>
      <DeviceJsonLd
        devices={devices.map((d) => ({
          name: d.name,
          slug: d.slug,
          href: d.href,
          brand: d.brand,
          os: d.os,
        }))}
      />
      <DevicesDirectory devices={devices} brandFilters={brands} />
    </>
  );
}
