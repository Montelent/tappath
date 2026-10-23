import type { Metadata } from "next";
import DevicePage from "@/components/devices/DevicePage";
import { getDevice } from "@/data/devices";

const device = getDevice("realme-12-pro-plus")!;

export const metadata: Metadata = {
  title: device.name,
  description: device.description,
};

export default function Page() {
  return <DevicePage device={device} />;
}
