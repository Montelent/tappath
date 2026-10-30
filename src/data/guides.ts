export type GuideStep = {
  id: number;
  instruction: string;
  highlight: string;
  detail?: string;
  /** Real phone screenshot URL (fits inside device frame) — TechBone-style */
  imageUrl?: string;
  /** Click marker position as % of screenshot (0–100) */
  markerX?: number;
  markerY?: number;
};

export type GuideVersion = {
  id: string;
  label: string;
  steps: GuideStep[];
};

export type Guide = {
  slug: string;
  brand: string;
  brandSlug: string;
  productLine: string;
  title: string;
  shortDescription: string;
  updated: string;
  readTime: string;
  category: string;
  versions: GuideVersion[];
  article: string[];
  faqs: { q: string; a: string }[];
  related: { title: string; href: string; category: string }[];
  compatibleDevices: { name: string; os: string; href: string }[];
  confirmations: number;
  forumVerified?: boolean;
};

export const guides: Record<string, Guide> = {
  "samsung-galaxy-remove-google-search-bar": {
    slug: "remove-google-search-bar",
    brand: "Samsung",
    brandSlug: "samsung",
    productLine: "Galaxy",
    title: "Remove Google Search Bar from Home Screen",
    shortDescription:
      "If the Google search bar keeps taking up space on your Samsung home screen even though you never use it, it is because the widget is preinstalled and pinned by default. Remove it in two taps.",
    updated: "12.08.2026",
    readTime: "2 min",
    category: "Display & Home Screen",
    versions: [
      {
        id: "oneui-7",
        label: "Android 15 · One UI 7",
        steps: [
          {
            id: 1,
            instruction: "Tap and hold the **Google Search Bar**",
            highlight: "Google Search Bar",
            detail: "Long-press the search widget on your home screen until the options menu appears.",
          },
          {
            id: 2,
            instruction: "Tap **Remove**",
            highlight: "Remove",
            detail: "Select Remove from the popup menu. The widget disappears immediately.",
          },
        ],
      },
      {
        id: "oneui-6",
        label: "Android 14 · One UI 6",
        steps: [
          {
            id: 1,
            instruction: "Tap and hold the **Google Search Bar**",
            highlight: "Google Search Bar",
            detail: "Long-press the search widget on your home screen until the options menu appears.",
          },
          {
            id: 2,
            instruction: "Tap **Remove**",
            highlight: "Remove",
            detail: "Select Remove from the popup menu. The widget disappears immediately.",
          },
        ],
      },
    ],
    article: [
      "The Google search bar widget is preinstalled on most Samsung Galaxy home screens.",
      "You can remove it with a long-press and Remove — it does not uninstall the Google app.",
    ],
    faqs: [
      {
        q: "Will removing the search bar uninstall Google?",
        a: "No. Only the home-screen widget is removed.",
      },
    ],
    related: [],
    compatibleDevices: [
      { name: "Galaxy S23+", os: "One UI 6", href: "/devices" },
      { name: "Galaxy S24", os: "One UI 6.1", href: "/devices" },
    ],
    confirmations: 120,
    forumVerified: true,
  },
  "samsung-galaxy-battery-percentage": {
    slug: "battery-percentage",
    brand: "Samsung",
    brandSlug: "samsung",
    productLine: "Galaxy",
    title: "Show Battery Percentage in Status Bar",
    shortDescription: "Show the exact battery percentage next to the battery icon on Samsung Galaxy.",
    updated: "10.08.2026",
    readTime: "2 min",
    category: "Battery & Power",
    versions: [
      {
        id: "oneui-6",
        label: "Android 14 · One UI 6",
        steps: [
          {
            id: 1,
            instruction: "Open **Settings**",
            highlight: "Settings",
          },
          {
            id: 2,
            instruction: "Tap **Battery and device care**",
            highlight: "Battery and device care",
          },
          {
            id: 3,
            instruction: "Tap **Battery**",
            highlight: "Battery",
          },
          {
            id: 4,
            instruction: "Enable **Show battery percentage**",
            highlight: "Show battery percentage",
          },
        ],
      },
    ],
    article: [
      "Samsung hides the numeric battery percentage by default on some One UI versions.",
      "Enable it under Battery and device care so you always see the exact charge level.",
    ],
    faqs: [],
    related: [],
    compatibleDevices: [{ name: "Galaxy S23+", os: "One UI 6", href: "/devices" }],
    confirmations: 45,
    forumVerified: true,
  },
  "xiaomi-smartphone-add-fingerprint": {
    slug: "add-fingerprint",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    productLine: "Smartphone",
    title: "Add a Fingerprint",
    shortDescription: "Register a fingerprint for unlock and payments on Xiaomi HyperOS / MIUI.",
    updated: "05.09.2026",
    readTime: "3 min",
    category: "Security",
    versions: [
      {
        id: "hyperos",
        label: "HyperOS",
        steps: [
          { id: 1, instruction: "Open **Settings**", highlight: "Settings" },
          { id: 2, instruction: "Tap **Lock screen & passwords**", highlight: "Lock screen & passwords" },
          { id: 3, instruction: "Tap **Fingerprint unlock**", highlight: "Fingerprint unlock" },
          { id: 4, instruction: "Follow on-screen prompts to **Add fingerprint**", highlight: "Add fingerprint" },
        ],
      },
    ],
    article: ["Xiaomi stores fingerprints securely in the TEE. You can register multiple fingers."],
    faqs: [],
    related: [],
    compatibleDevices: [],
    confirmations: 22,
    forumVerified: true,
  },
  "samsung-galaxy-private-dns": {
    slug: "private-dns",
    brand: "Samsung",
    brandSlug: "samsung",
    productLine: "Galaxy",
    title: "Set Up Private DNS",
    shortDescription: "Use Private DNS (DNS-over-TLS) on Samsung Galaxy for encrypted DNS queries.",
    updated: "01.09.2026",
    readTime: "3 min",
    category: "Network & Connectivity",
    versions: [
      {
        id: "oneui-6",
        label: "One UI 6",
        steps: [
          { id: 1, instruction: "Open **Settings**", highlight: "Settings" },
          { id: 2, instruction: "Tap **Connections**", highlight: "Connections" },
          { id: 3, instruction: "Tap **More connection settings**", highlight: "More connection settings" },
          { id: 4, instruction: "Tap **Private DNS**", highlight: "Private DNS" },
          { id: 5, instruction: "Select **Private DNS provider hostname** and enter your provider", highlight: "Private DNS provider hostname" },
        ],
      },
    ],
    article: ["Private DNS encrypts DNS lookups. Common hosts include dns.google and one.one.one.one."],
    faqs: [],
    related: [],
    compatibleDevices: [],
    confirmations: 8,
    forumVerified: true,
  },
};

export function getGuide(key: string): Guide | undefined {
  return guides[key];
}
