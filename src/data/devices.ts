export type Device = {
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  os: string;
  year?: number;
  series?: string;
  href: string;
  guides: { title: string; href: string; category: string }[];
  relatedDevices: { name: string; os: string; href: string }[];
  description: string;
};

export const devices: Device[] = [
  {
    slug: "galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    brandSlug: "samsung",
    os: "One UI 8 / Android 16",
    year: 2024,
    series: "Galaxy S",
    href: "/samsung/galaxy-s24-ultra",
    description:
      "Flagship Samsung Galaxy S24 Ultra running One UI. Browse verified step-by-step guides and settings paths for this device.",
    guides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
      { title: "Set Up Private DNS", href: "/samsung/galaxy/private-dns", category: "Network & Connectivity" },
      { title: "Show Battery Percentage in Status Bar", href: "/samsung/galaxy/battery-percentage", category: "Battery & Power" },
      { title: "Set Default Home Screen Launcher", href: "/samsung/galaxy/default-system-launcher", category: "Display & Home Screen" },
      { title: "Allow Unknown App Installations", href: "/samsung/galaxy/install-unknown-apps", category: "Apps & Installation" },
    ],
    relatedDevices: [
      { name: "Samsung Galaxy S26 Ultra", os: "One UI 8 / Android 16", href: "/samsung/galaxy-s26-ultra" },
      { name: "Samsung Galaxy S23 Ultra", os: "One UI 7 / Android 15", href: "/samsung/galaxy-s23-ultra" },
      { name: "Samsung Galaxy A55 5G", os: "One UI 8 / Android 16", href: "/samsung/galaxy-a55-5g" },
    ],
  },
  {
    slug: "galaxy-s26-ultra",
    name: "Samsung Galaxy S26 Ultra",
    brand: "Samsung",
    brandSlug: "samsung",
    os: "One UI 8 / Android 16",
    year: 2026,
    series: "Galaxy S",
    href: "/samsung/galaxy-s26-ultra",
    description:
      "Latest Samsung Galaxy S26 Ultra. Guides and menu paths verified for One UI 8.",
    guides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
      { title: "Set Up Private DNS", href: "/samsung/galaxy/private-dns", category: "Network & Connectivity" },
    ],
    relatedDevices: [
      { name: "Samsung Galaxy S24 Ultra", os: "One UI 8 / Android 16", href: "/samsung/galaxy-s24-ultra" },
    ],
  },
  {
    slug: "galaxy-a55-5g",
    name: "Samsung Galaxy A55 5G",
    brand: "Samsung",
    brandSlug: "samsung",
    os: "One UI 8 / Android 16",
    year: 2024,
    series: "Galaxy A",
    href: "/samsung/galaxy-a55-5g",
    description:
      "Mid-range Galaxy A55 5G. Step-by-step settings guides with Live Simulator.",
    guides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
      { title: "Show Battery Percentage in Status Bar", href: "/samsung/galaxy/battery-percentage", category: "Battery & Power" },
    ],
    relatedDevices: [
      { name: "Samsung Galaxy A35", os: "One UI 6 / Android 14", href: "/samsung/galaxy-a35" },
      { name: "Samsung Galaxy S24 Ultra", os: "One UI 8 / Android 16", href: "/samsung/galaxy-s24-ultra" },
    ],
  },
  {
    slug: "galaxy-a05",
    name: "Samsung Galaxy A05",
    brand: "Samsung",
    brandSlug: "samsung",
    os: "One UI 5",
    year: 2023,
    series: "Galaxy A",
    href: "/samsung/galaxy-a05",
    description: "Entry-level Galaxy A05 with One UI 5 guides.",
    guides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
    ],
    relatedDevices: [],
  },
  {
    slug: "galaxy-a14-5g",
    name: "Samsung Galaxy A14 5G",
    brand: "Samsung",
    brandSlug: "samsung",
    os: "One UI 5",
    year: 2023,
    series: "Galaxy A",
    href: "/samsung/galaxy-a14-5g",
    description: "Galaxy A14 5G settings and help guides.",
    guides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
    ],
    relatedDevices: [],
  },
  {
    slug: "galaxy-a16-5g",
    name: "Samsung Galaxy A16 5G",
    brand: "Samsung",
    brandSlug: "samsung",
    os: "One UI 5 / Android 13",
    year: 2024,
    series: "Galaxy A",
    href: "/samsung/galaxy-a16-5g",
    description: "Galaxy A16 5G verified menu paths.",
    guides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
    ],
    relatedDevices: [],
  },
  {
    slug: "xiaomi-14-ultra",
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    os: "HyperOS / Android 15",
    year: 2024,
    series: "Xiaomi",
    href: "/xiaomi/xiaomi-14-ultra",
    description: "Xiaomi 14 Ultra flagship with HyperOS guides.",
    guides: [
      { title: "Split Screen on Xiaomi Phones", href: "/xiaomi/smartphone/split-screen", category: "Display & Home Screen" },
      { title: "Add a Fingerprint", href: "/xiaomi/smartphone/add-fingerprint", category: "Security & Privacy" },
    ],
    relatedDevices: [
      { name: "Xiaomi 13T", os: "HyperOS / Android 14", href: "/xiaomi/xiaomi-13t" },
    ],
  },
  {
    slug: "redmi-note-13-pro-5g",
    name: "Redmi Note 13 Pro 5G",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    os: "HyperOS / Android 14",
    year: 2024,
    series: "Redmi Note",
    href: "/xiaomi/redmi-note-13-pro-5g",
    description: "Redmi Note 13 Pro 5G — HyperOS settings guides.",
    guides: [
      { title: "App Lock: Protecting Individual Apps", href: "/xiaomi/smartphone/app-lock", category: "Security & Privacy" },
      { title: "Status Bar Settings & Icons", href: "/xiaomi/smartphone/status-bar", category: "Display & Home Screen" },
    ],
    relatedDevices: [],
  },
  {
    slug: "pixel-9-pro",
    name: "Google Pixel 9 Pro",
    brand: "Google",
    brandSlug: "google",
    os: "Android 15",
    year: 2024,
    series: "Pixel",
    href: "/google/pixel-9-pro",
    description: "Pixel 9 Pro pure Android guides and troubleshooting.",
    guides: [
      { title: "Pixel Settings, Tools and Troubleshooting", href: "/google/pixel/pixel-help", category: "System & Settings" },
    ],
    relatedDevices: [
      { name: "Pixel 8 Pro", os: "Android 15", href: "/google/pixel-8-pro" },
    ],
  },
  {
    slug: "oneplus-12",
    name: "OnePlus 12",
    brand: "OnePlus",
    brandSlug: "oneplus",
    os: "OxygenOS 14 / Android 14",
    year: 2024,
    series: "OnePlus",
    href: "/oneplus/oneplus-12",
    description: "OnePlus 12 OxygenOS step-by-step guides.",
    guides: [
      { title: "Zen Mode Setup", href: "/oneplus/smartphone/zen-mode", category: "Notifications & Focus" },
      { title: "Enable Developer Options", href: "/oneplus/smartphone/developer-options", category: "System & Settings" },
    ],
    relatedDevices: [],
  },
  {
    slug: "realme-12-pro-plus",
    name: "Realme 12 Pro+",
    brand: "Realme",
    brandSlug: "realme",
    os: "Realme UI 5",
    year: 2024,
    series: "Realme",
    href: "/realme/12-pro-plus",
    description: "Realme 12 Pro+ with Realme UI guides.",
    guides: [
      { title: "Developer Options Explained", href: "/realme/smartphone/developer-options", category: "System & Settings" },
      { title: "App Lock: Protecting Individual Apps", href: "/realme/smartphone/app-lock", category: "Security & Privacy" },
    ],
    relatedDevices: [
      { name: "Realme 10 Pro+", os: "Realme UI 4", href: "/realme/10-pro-plus" },
    ],
  },
  {
    slug: "oppo-find-x7",
    name: "Oppo Find X7",
    brand: "Oppo",
    brandSlug: "oppo",
    os: "ColorOS 14 / Android 14",
    year: 2024,
    series: "Find X",
    href: "/oppo/find-x7",
    description: "Oppo Find X7 ColorOS settings guides.",
    guides: [
      { title: "Enable Developer Options", href: "/oppo/smartphone/developer-options", category: "System & Settings" },
      { title: "App Lock Setup", href: "/oppo/smartphone/app-lock", category: "Security & Privacy" },
    ],
    relatedDevices: [],
  },
];

export function getDevice(slug: string): Device | undefined {
  return devices.find((d) => d.slug === slug);
}

export function getDevicesByBrand(brandSlug: string): Device[] {
  return devices.filter((d) => d.brandSlug === brandSlug);
}

export function getAllDevices(): Device[] {
  return devices;
}

export const brandFilters = [
  { name: "All", slug: "all" },
  { name: "Samsung", slug: "samsung" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "Google", slug: "google" },
  { name: "OnePlus", slug: "oneplus" },
  { name: "Realme", slug: "realme" },
  { name: "Oppo", slug: "oppo" },
  { name: "Huawei", slug: "huawei" },
];
