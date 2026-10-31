import { getSiteSettings } from "@/lib/site-settings";

export type AdPlacement =
  | "header"
  | "after_title"
  | "after_simulator"
  | "mid_content"
  | "before_footer"
  | "sidebar";

const KEY: Record<AdPlacement, keyof Awaited<ReturnType<typeof getSiteSettings>>> = {
  header: "ad_header",
  after_title: "ad_after_title",
  after_simulator: "ad_after_simulator",
  mid_content: "ad_mid_content",
  before_footer: "ad_before_footer",
  sidebar: "ad_sidebar",
};

type Props = {
  placement: AdPlacement;
  className?: string;
};

export default async function AdSlot({ placement, className = "" }: Props) {
  const s = await getSiteSettings();
  if (!s.ads_enabled) return null;
  const html = String(s[KEY[placement]] || "").trim();
  if (!html) return null;

  return (
    <aside
      className={`ad-slot ad-slot--${placement} my-6 flex justify-center overflow-hidden ${className}`}
      aria-label="Advertisement"
      data-ad-placement={placement}
    >
      <div
        className="w-full max-w-[728px] min-h-[50px] text-center [&_iframe]:mx-auto [&_ins]:mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </aside>
  );
}
