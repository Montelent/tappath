import { getSiteSettings } from "@/lib/site-settings";
import CustomCodeClient from "@/components/CustomCodeClient";

type Slot = "head" | "body_start" | "footer";

export default async function CustomCode({ slot }: { slot: Slot }) {
  const s = await getSiteSettings();
  const html =
    slot === "head"
      ? s.head_code
      : slot === "body_start"
        ? s.body_start_code
        : s.footer_code;
  const trimmed = (html || "").trim();
  if (!trimmed) return null;

  return <CustomCodeClient slot={slot} html={trimmed} />;
}
