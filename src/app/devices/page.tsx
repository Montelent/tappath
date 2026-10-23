import type { Metadata } from "next";
import DevicesDirectory from "@/components/devices/DevicesDirectory";
import { getAllDevices } from "@/data/devices";

export const metadata: Metadata = {
  title: "All smartphone models & specs",
  description:
    "Device directory — search and filter smartphone models with guides, OS versions and specs.",
};

export default function DevicesPage() {
  const devices = getAllDevices();
  return <DevicesDirectory devices={devices} />;
}
