import type { Metadata } from "next";
import GlossaryIndex from "@/components/glossary/GlossaryIndex";

export const metadata: Metadata = {
  title: "Tech glossary: smartphone & technology terms explained",
  description:
    "Smartphone and technology terms explained simply — Network, System, Battery, Security, Display, Camera, Messaging and more.",
};

export default function GlossaryPage() {
  return <GlossaryIndex />;
}
