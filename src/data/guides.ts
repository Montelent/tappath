export type GuideStep = {
  id: number;
  instruction: string;
  highlight: string;
  detail?: string;
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
      "Long-press the Google search bar widget on your home screen.",
      "Tap Remove from the menu that appears.",
    ],
    faqs: [
      {
        q: "Will Google Search still work?",
        a: "Yes. You can still swipe up or use the Google app. Only the home-screen widget is removed.",
      },
    ],
    related: [
      {
        title: "Show battery percentage",
        href: "/samsung/galaxy/battery-percentage",
        category: "Display & Home Screen",
      },
    ],
    compatibleDevices: [
      { name: "Samsung Galaxy S24 Ultra", os: "One UI 7 / Android 15", href: "/samsung/galaxy-s24-ultra" },
    ],
    confirmations: 128,
    forumVerified: true,
  },
  "samsung-galaxy-battery-percentage": {
    slug: "battery-percentage",
    brand: "Samsung",
    brandSlug: "samsung",
    productLine: "Galaxy",
    title: "Show Battery Percentage in Status Bar",
    shortDescription: "Display the numeric battery percentage next to the battery icon on Samsung Galaxy.",
    updated: "12.08.2026",
    readTime: "2 min",
    category: "Display & Home Screen",
    versions: [
      {
        id: "oneui-7",
        label: "Android 15 · One UI 7",
        steps: [
          { id: 1, instruction: "Open **Settings**", highlight: "Settings" },
          { id: 2, instruction: "Tap **Battery**", highlight: "Battery" },
          { id: 3, instruction: "Enable **Show battery percentage**", highlight: "Show battery percentage" },
        ],
      },
    ],
    article: [
      "Open Settings on your Galaxy phone.",
      "Go to Battery and turn on Show battery percentage.",
    ],
    faqs: [
      { q: "Does this drain battery?", a: "No. Showing a percentage uses negligible power." },
    ],
    related: [
      {
        title: "Remove Google Search Bar from Home Screen",
        href: "/samsung/galaxy/remove-google-search-bar",
        category: "Display & Home Screen",
      },
    ],
    compatibleDevices: [
      { name: "Samsung Galaxy S24 Ultra", os: "One UI 7 / Android 15", href: "/samsung/galaxy-s24-ultra" },
    ],
    confirmations: 42,
    forumVerified: true,
  },
  "xiaomi-smartphone-add-fingerprint": {
    slug: "add-fingerprint",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    productLine: "Smartphone",
    title: "Add a Fingerprint",
    shortDescription:
      "Register a fingerprint on your Xiaomi or Redmi phone so you can unlock and confirm payments quickly.",
    updated: "28.10.2026",
    readTime: "3 min",
    category: "Security",
    versions: [
      {
        id: "hyperos",
        label: "HyperOS · Android 14",
        steps: [
          {
            id: 1,
            instruction: "Open **Settings**",
            highlight: "Settings",
            detail: "From the home screen or app drawer.",
          },
          {
            id: 2,
            instruction: "Tap **Fingerprint, face data & password** (or **Passwords & security**)",
            highlight: "Fingerprint, face data & password",
          },
          {
            id: 3,
            instruction: "Tap **Fingerprint unlock**",
            highlight: "Fingerprint unlock",
          },
          {
            id: 4,
            instruction:
              "Enter your screen lock, then **Add fingerprint** and follow the on-screen prompts",
            highlight: "Add fingerprint",
          },
        ],
      },
    ],
    article: [
      "Open Settings on your Xiaomi phone.",
      "Go to Fingerprint, face data & password (wording may vary by MIUI/HyperOS version).",
      "Choose Fingerprint unlock and authenticate with your PIN, pattern, or password.",
      "Tap Add fingerprint and place your finger on the sensor until the print is fully registered.",
    ],
    faqs: [
      {
        q: "Where is the fingerprint sensor?",
        a: "On many Xiaomi models it is under the display or on the power button. The setup screen shows where to touch.",
      },
    ],
    related: [],
    compatibleDevices: [
      { name: "Xiaomi 14", os: "HyperOS", href: "/xiaomi" },
      { name: "Redmi Note 13", os: "HyperOS", href: "/xiaomi" },
    ],
    confirmations: 12,
    forumVerified: true,
  },
  "samsung-galaxy-add-fingerprint": {
    slug: "add-fingerprint",
    brand: "Samsung",
    brandSlug: "samsung",
    productLine: "Galaxy",
    title: "Add a Fingerprint",
    shortDescription: "Set up fingerprint unlock on Samsung Galaxy with One UI.",
    updated: "28.10.2026",
    readTime: "3 min",
    category: "Security",
    versions: [
      {
        id: "oneui-7",
        label: "Android 15 · One UI 7",
        steps: [
          {
            id: 1,
            instruction: "Open **Settings** → **Security and privacy**",
            highlight: "Security and privacy",
          },
          {
            id: 2,
            instruction: "Tap **Biometrics** → **Fingerprints**",
            highlight: "Fingerprints",
          },
          {
            id: 3,
            instruction: "Unlock, then **Add fingerprint** and follow the prompts",
            highlight: "Add fingerprint",
          },
        ],
      },
    ],
    article: [
      "Open Settings and go to Security and privacy.",
      "Open Biometrics, then Fingerprints.",
      "Authenticate and add a new fingerprint following the on-screen guide.",
    ],
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
