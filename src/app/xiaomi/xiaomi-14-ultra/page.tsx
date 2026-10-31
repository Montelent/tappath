export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DevicePage from "@/components/devices/DevicePage";
import { resolveDevice } from "@/lib/devices/resolve";
export async function generateMetadata(): Promise<Metadata> {
  const device = await resolveDevice("xiaomi-14-ultra");
  if (!device) return { title: "Device not found" };
  return { title: device.name, description: device.description };
}
export default async function Page() {
  const device = await resolveDevice("xiaomi-14-ultra");
  if (!device) notFound();
  return <DevicePage device={device} />;
}
