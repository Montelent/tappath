import type { Metadata } from "next";
import GuidePage from "@/components/guide/GuidePage";
import { guides } from "@/data/guides";

const guide = guides["samsung-galaxy-remove-google-search-bar"];

export const metadata: Metadata = {
  title: `Samsung: ${guide.title}`,
  description: guide.shortDescription,
};

export default function RemoveGoogleSearchBarPage() {
  return <GuidePage guide={guide} />;
}
