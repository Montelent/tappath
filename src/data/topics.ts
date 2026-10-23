export type TopicGuide = {
  title: string;
  brand: string;
  brandSlug: string;
  href: string;
  steps?: number;
  readTime?: string;
};

export type Topic = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  guideCount: number;
  faqs: { q: string; a: string }[];
  guidesByBrand: { brand: string; brandSlug: string; guides: TopicGuide[] }[];
};

export const topics: Topic[] = [
  {
    slug: "network",
    name: "Network & Connectivity",
    description:
      "Wi‑Fi, Bluetooth, hotspot, mobile data and connection issues — cross-brand step-by-step guides for Samsung, Xiaomi, Huawei and other devices.",
    icon: "Wifi",
    guideCount: 438,
    faqs: [
      {
        q: "Why won’t my phone connect to Wi‑Fi?",
        a: "Common causes are a wrong password, an outdated router mode (e.g. 5 GHz only), or app battery-saving settings. Reset network settings, or forget the network and reconnect — the guides below show the exact path for each brand.",
      },
      {
        q: "How do I turn on Bluetooth on Samsung, Apple or Xiaomi?",
        a: "Usually under Settings → Connections → Bluetooth. Paths differ slightly by OEM; open the brand-specific guide for the exact taps.",
      },
      {
        q: "What can I do about weak mobile signal?",
        a: "Check airplane mode is off, toggle mobile data, try a different network mode (4G/5G), or reset network settings. Carrier settings and SIM placement can also matter.",
      },
      {
        q: "How do I set up a Wi‑Fi hotspot?",
        a: "Typically Settings → Connections → Mobile Hotspot and Tethering. Enable the hotspot and set a password. Brand guides show the precise menu path.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Set Up Private DNS", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/private-dns", steps: 5, readTime: "3 min" },
          { title: "Turn Nearby Device Scanning On or Off", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/nearby-device-scanning", steps: 4, readTime: "2 min" },
          { title: "Enable Wi‑Fi Calling", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/wifi-calling", steps: 6, readTime: "4 min" },
          { title: "Configure Mobile Hotspot", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/mobile-hotspot", steps: 5, readTime: "3 min" },
        ],
      },
      {
        brand: "Xiaomi",
        brandSlug: "xiaomi",
        guides: [
          { title: "Set Up Private DNS", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/private-dns", steps: 5, readTime: "3 min" },
          { title: "Enable VoLTE", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/volte", steps: 4, readTime: "2 min" },
          { title: "Configure Hotspot", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/hotspot", steps: 5, readTime: "3 min" },
        ],
      },
      {
        brand: "Realme",
        brandSlug: "realme",
        guides: [
          { title: "VoLTE Setup", brand: "Realme", brandSlug: "realme", href: "/realme/smartphone/volte", steps: 4, readTime: "2 min" },
          { title: "Private DNS", brand: "Realme", brandSlug: "realme", href: "/realme/smartphone/private-dns", steps: 5, readTime: "3 min" },
        ],
      },
    ],
  },
  {
    slug: "display",
    name: "Display & Home Screen",
    description:
      "Brightness, Always On Display, Dark Mode, widgets and the Home Screen — customise the display on Samsung, Xiaomi and more.",
    icon: "Monitor",
    guideCount: 312,
    faqs: [
      {
        q: "How do I remove the Google search bar from the home screen?",
        a: "It is a widget. Long-press it and tap Remove. The Google app stays installed.",
      },
      {
        q: "How do I turn on Always On Display?",
        a: "Usually under Settings → Lock screen → Always On Display. Paths vary by brand and One UI / HyperOS version.",
      },
      {
        q: "Can I change the screen timeout?",
        a: "Yes — Settings → Display → Screen timeout (or similar). Choose 15 seconds to 10 minutes depending on the device.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Remove Google Search Bar from Home Screen", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/remove-google-search-bar", steps: 2, readTime: "2 min" },
          { title: "Set Default Home Screen Launcher", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/default-system-launcher", steps: 4, readTime: "3 min" },
          { title: "Remove a Widget from the Home Screen", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/remove-widget", steps: 2, readTime: "1 min" },
          { title: "Show Battery Percentage in Status Bar", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/battery-percentage", steps: 4, readTime: "2 min" },
        ],
      },
      {
        brand: "Xiaomi",
        brandSlug: "xiaomi",
        guides: [
          { title: "Split Screen on Xiaomi Phones", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/split-screen", steps: 5, readTime: "3 min" },
          { title: "Status Bar Settings & Icons", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/status-bar", steps: 6, readTime: "4 min" },
          { title: "Turn On Always On Display", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/always-on-display", steps: 4, readTime: "2 min" },
        ],
      },
    ],
  },
  {
    slug: "battery",
    name: "Battery & Power",
    description:
      "Improve battery life, control charging and use power-saving modes properly — cross-brand tips and step-by-step guides.",
    icon: "Battery",
    guideCount: 198,
    faqs: [
      {
        q: "How do I enable battery saver mode?",
        a: "Typically Settings → Battery → Power saving mode (or Adaptive battery). Brand guides show the exact path.",
      },
      {
        q: "Why is my battery draining so fast?",
        a: "Check screen-on time, background apps, location services, and adaptive battery settings. Restrict high-usage apps if needed.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Show Battery Percentage in Status Bar", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/battery-percentage", steps: 4, readTime: "2 min" },
          { title: "Enable Power Saving Mode", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/power-saving", steps: 3, readTime: "2 min" },
        ],
      },
      {
        brand: "Xiaomi",
        brandSlug: "xiaomi",
        guides: [
          { title: "Battery Optimization Settings", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/battery-optimization", steps: 5, readTime: "3 min" },
        ],
      },
    ],
  },
  {
    slug: "security",
    name: "Security & Privacy",
    description:
      "Screen lock, biometric unlock, privacy and secure settings — protect your device with clear step-by-step guides.",
    icon: "Shield",
    guideCount: 267,
    faqs: [
      {
        q: "How do I add a fingerprint?",
        a: "Settings → Security / Biometrics → Fingerprints. Follow the on-screen enrollment. Paths differ slightly by OEM.",
      },
      {
        q: "What is App Lock?",
        a: "A feature that requires a PIN, pattern or biometric to open specific apps. Available on many Xiaomi, Realme, Oppo and Samsung devices.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Xiaomi",
        brandSlug: "xiaomi",
        guides: [
          { title: "Add a Fingerprint", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/add-fingerprint", steps: 7, readTime: "6 min" },
          { title: "App Lock: Protecting Individual Apps", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/app-lock", steps: 5, readTime: "3 min" },
        ],
      },
      {
        brand: "Realme",
        brandSlug: "realme",
        guides: [
          { title: "App Lock: Protecting Individual Apps", brand: "Realme", brandSlug: "realme", href: "/realme/smartphone/app-lock", steps: 5, readTime: "3 min" },
        ],
      },
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Turn On/Off Device Administrators", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/device-administrators", steps: 4, readTime: "2 min" },
        ],
      },
    ],
  },
  {
    slug: "notifications",
    name: "Notifications & Focus",
    description:
      "Control notifications, use Do Not Disturb and tame noisy alerts — guides for all major smartphone brands.",
    icon: "Bell",
    guideCount: 145,
    faqs: [
      {
        q: "How do I silence notifications at night?",
        a: "Use Do Not Disturb / Focus mode. Schedule it under Settings → Notifications or Sounds.",
      },
    ],
    guidesByBrand: [
      {
        brand: "OnePlus",
        brandSlug: "oneplus",
        guides: [
          { title: "Zen Mode Setup", brand: "OnePlus", brandSlug: "oneplus", href: "/oneplus/smartphone/zen-mode", steps: 4, readTime: "2 min" },
        ],
      },
    ],
  },
  {
    slug: "messaging",
    name: "Calls & Messages",
    description:
      "Calls, SMS, spam filters and messaging apps — set up communication on your smartphone reliably.",
    icon: "MessageSquare",
    guideCount: 156,
    faqs: [
      {
        q: "How do I block spam calls?",
        a: "Most brands offer a built-in caller ID / spam filter under Phone app settings or Connections.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Change Incoming Call Display While Using Apps", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/control-how-incoming-calls-appear-while-using-apps", steps: 4, readTime: "2 min" },
        ],
      },
    ],
  },
  {
    slug: "apps",
    name: "Apps & Installation",
    description:
      "Install, update and uninstall apps, and manage permissions — practical guides for the major smartphone brands.",
    icon: "Package",
    guideCount: 189,
    faqs: [
      {
        q: "How do I allow unknown app installations?",
        a: "Settings → Apps → Special access → Install unknown apps (or similar). Enable only for trusted sources.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Allow Unknown App Installations", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/install-unknown-apps", steps: 5, readTime: "3 min" },
        ],
      },
    ],
  },
  {
    slug: "media",
    name: "Photo, Video & Media",
    description:
      "Camera, gallery, screenshots and media sharing — practical guides for photo, video and audio.",
    icon: "Camera",
    guideCount: 98,
    faqs: [],
    guidesByBrand: [],
  },
  {
    slug: "system",
    name: "System & Settings",
    description:
      "System updates, language, date/time and core settings — stay in control of your operating system.",
    icon: "Settings",
    guideCount: 221,
    faqs: [
      {
        q: "How do I enable Developer Options?",
        a: "Tap Build number 7 times under About phone. Then open Developer options from the main Settings list.",
      },
    ],
    guidesByBrand: [
      {
        brand: "Realme",
        brandSlug: "realme",
        guides: [
          { title: "Developer Options Explained", brand: "Realme", brandSlug: "realme", href: "/realme/smartphone/developer-options", steps: 6, readTime: "4 min" },
          { title: "Multiple User Accounts & Guest Mode", brand: "Realme", brandSlug: "realme", href: "/realme/smartphone/multiple-users", steps: 5, readTime: "3 min" },
        ],
      },
      {
        brand: "Samsung",
        brandSlug: "samsung",
        guides: [
          { title: "Turn On/Off Easy Mode", brand: "Samsung", brandSlug: "samsung", href: "/samsung/galaxy/easy-mode", steps: 3, readTime: "2 min" },
        ],
      },
    ],
  },
  {
    slug: "storage",
    name: "Storage & Backup",
    description:
      "Free up space, create backups and manage files — guides for when storage is full.",
    icon: "HardDrive",
    guideCount: 87,
    faqs: [],
    guidesByBrand: [],
  },
  {
    slug: "accessibility",
    name: "Accessibility",
    description:
      "Font size, contrast, screen readers and more accessibility tools — make your smartphone easier to use.",
    icon: "Accessibility",
    guideCount: 64,
    faqs: [],
    guidesByBrand: [],
  },
  {
    slug: "accounts",
    name: "Accounts & Cloud",
    description:
      "Google, Apple and manufacturer accounts, sync and cloud — set up accounts securely and stay organised.",
    icon: "Cloud",
    guideCount: 72,
    faqs: [],
    guidesByBrand: [],
  },
  {
    slug: "language-input",
    name: "Language & Input",
    description:
      "Keyboard, system language, dictation, emoji and input methods — set up language and typing on Samsung, Xiaomi and other devices.",
    icon: "Languages",
    guideCount: 91,
    faqs: [],
    guidesByBrand: [
      {
        brand: "Xiaomi",
        brandSlug: "xiaomi",
        guides: [
          { title: "Add a Keyboard Language", brand: "Xiaomi", brandSlug: "xiaomi", href: "/xiaomi/smartphone/add-keyboard-language", steps: 9, readTime: "7 min" },
        ],
      },
    ],
  },
  {
    slug: "other",
    name: "Other",
    description:
      "More tips and guides that don’t fit the main categories — still practical and cross-brand.",
    icon: "MoreHorizontal",
    guideCount: 45,
    faqs: [],
    guidesByBrand: [],
  },
];

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function getAllTopics(): Topic[] {
  return topics;
}
