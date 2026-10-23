import type { Metadata } from "next";
import DevicePage from "@/components/devices/DevicePage";
import { getDevice } from "@/data/devices";

const device = getDevice("galaxy-a55-5g")!;

export const metadata: Metadata = {
  title: device.name,
  description: device.description,
};

export default function GalaxyA55Page() {
  return <DevicePage device={device} />;
}
