export type Brand = {
  slug: string;
  name: string;
  guides: number;
  devices: number;
  topicHubs: number;
  color: string;
  description: string;
  productLines: { name: string; count: number; href: string }[];
  topGuides: { title: string; href: string; category: string }[];
  devicesList: { name: string; os: string; href: string }[];
  forumTopics: { title: string; device: string; author: string; date: string; views: number; replies: number; href: string }[];
  seoText: {
    updates: string;
    help: string;
  };
};

export const brands: Record<string, Brand> = {
  samsung: {
    slug: "samsung",
    name: "Samsung",
    guides: 558,
    devices: 441,
    topicHubs: 0,
    color: "bg-blue-500",
    description:
      "Find step-by-step guides, verified menu paths and settings breakdowns for Samsung devices running One UI. Every topic covers setup, connectivity, battery and system options with an interactive live simulator.",
    productLines: [
      { name: "Galaxy", count: 558, href: "/samsung/galaxy" },
    ],
    topGuides: [
      { title: "Remove Google Search Bar from Home Screen", href: "/samsung/galaxy/remove-google-search-bar", category: "Display & Home Screen" },
      { title: "Set Default Home Screen Launcher", href: "/samsung/galaxy/default-system-launcher", category: "Display & Home Screen" },
      { title: "Set Up Private DNS", href: "/samsung/galaxy/private-dns", category: "Network & Connectivity" },
      { title: "Remove a Widget from the Home Screen", href: "/samsung/galaxy/remove-widget", category: "Display & Home Screen" },
      { title: "Allow Unknown App Installations", href: "/samsung/galaxy/install-unknown-apps", category: "Apps & Installation" },
      { title: "Turn On/Off Easy Mode", href: "/samsung/galaxy/easy-mode", category: "System & Settings" },
      { title: "Show Battery Percentage in Status Bar", href: "/samsung/galaxy/battery-percentage", category: "Battery & Power" },
      { title: "Turn Nearby Device Scanning On or Off", href: "/samsung/galaxy/nearby-device-scanning", category: "Network & Connectivity" },
    ],
    devicesList: [
      { name: "Samsung Galaxy S24 Ultra", os: "One UI 8 / Android 16", href: "/samsung/galaxy-s24-ultra" },
      { name: "Samsung Galaxy S26 Ultra", os: "One UI 8 / Android 16", href: "/samsung/galaxy-s26-ultra" },
      { name: "Samsung Galaxy A55 5G", os: "One UI 8 / Android 16", href: "/samsung/galaxy-a55-5g" },
      { name: "Samsung Galaxy A05", os: "One UI 5", href: "/samsung/galaxy-a05" },
      { name: "Samsung Galaxy A14 5G", os: "One UI 5", href: "/samsung/galaxy-a14-5g" },
      { name: "Samsung Galaxy A16 5G", os: "One UI 5 / Android 13", href: "/samsung/galaxy-a16-5g" },
    ],
    forumTopics: [
      { title: "A20 getting unsupported SD card on all cards", device: "Galaxy A20", author: "jpps99", date: "24 Jul 2022", views: 2692, replies: 3, href: "/forum/samsung/galaxy-a20/a20-getting-unsupported-sd-card" },
      { title: "Decrypt SD card", device: "Galaxy Tab A7 Lite", author: "Jimp48", date: "22 Jun 2022", views: 3901, replies: 12, href: "/forum/samsung/galaxy-tab-a7-lite/decrypt-sd-card" },
      { title: "How do I activate WiFi Calling?", device: "Galaxy A21s", author: "Fritz", date: "22 Dec 2020", views: 7102, replies: 6, href: "/forum/samsung/galaxy-a21s/wifi-calling" },
    ],
    seoText: {
      updates:
        "One UI updates shift menu items, rename settings and add new toggles. TapPath tracks these changes and keeps every menu path current, so you always find the right screen after an update.",
      help: "Get guidance on initial setup, Wi-Fi and mobile network settings, battery and power management, and general system options. Each topic links to a live simulator that mirrors the actual Samsung menu structure.",
    },
  },
  xiaomi: {
    slug: "xiaomi",
    name: "Xiaomi",
    guides: 556,
    devices: 401,
    topicHubs: 2,
    color: "bg-orange-500",
    description:
      "Find step-by-step guides, verified menu paths and settings help for Xiaomi phones and tablets, checked against the current Android build and ready to use in the interactive Live Simulator.",
    productLines: [
      { name: "Smartphone", count: 556, href: "/xiaomi/smartphone" },
    ],
    topGuides: [
      { title: "Split Screen on Xiaomi Phones", href: "/xiaomi/smartphone/split-screen", category: "Display & Home Screen" },
      { title: "Add a Fingerprint", href: "/xiaomi/smartphone/add-fingerprint", category: "Security & Privacy" },
      { title: "Developer Options Explained", href: "/xiaomi/smartphone/developer-options", category: "System & Settings" },
      { title: "App Lock: Protecting Individual Apps", href: "/xiaomi/smartphone/app-lock", category: "Security & Privacy" },
      { title: "Status Bar Settings & Icons", href: "/xiaomi/smartphone/status-bar", category: "Display & Home Screen" },
      { title: "Multiple User Accounts & Guest Mode", href: "/xiaomi/smartphone/multiple-users", category: "System & Settings" },
      { title: "Add a Keyboard Language", href: "/xiaomi/smartphone/add-keyboard-language", category: "Language & Input" },
      { title: "Turn On Always On Display", href: "/xiaomi/smartphone/always-on-display", category: "Display & Home Screen" },
    ],
    devicesList: [
      { name: "Xiaomi 14 Ultra", os: "HyperOS / Android 15", href: "/xiaomi/xiaomi-14-ultra" },
      { name: "Redmi Note 13 Pro 5G", os: "HyperOS / Android 14", href: "/xiaomi/redmi-note-13-pro-5g" },
      { name: "Xiaomi 13T", os: "HyperOS / Android 14", href: "/xiaomi/xiaomi-13t" },
      { name: "POCO F5", os: "HyperOS / Android 14", href: "/xiaomi/poco-f5" },
      { name: "Redmi Note 12", os: "MIUI 14 / Android 13", href: "/xiaomi/redmi-note-12" },
      { name: "Xiaomi 12", os: "HyperOS / Android 14", href: "/xiaomi/xiaomi-12" },
    ],
    forumTopics: [
      { title: "VoLTE issues on Realme / Xiaomi devices", device: "various", author: "Dine Rauf", date: "15 Sep 2026", views: 384, replies: 0, href: "/forum/xiaomi/volte" },
      { title: "Banking app blocked – how to unblock", device: "Redmi Note 13 Pro 5G", author: "stephanie", date: "29 Sep 2026", views: 92, replies: 14, href: "/forum/xiaomi/banking-unblock" },
    ],
    seoText: {
      updates:
        "Android updates on Xiaomi devices regularly move menu items or rename settings entries. TapPath tracks these shifts and keeps every guide and menu path aligned with the version currently running on your device.",
      help: "Guides cover initial setup, Wi-Fi and mobile network configuration, battery and power management, and core system settings. Each topic links to a Live Simulator so you can follow the exact tap sequence on your own device.",
    },
  },
  huawei: {
    slug: "huawei",
    name: "Huawei",
    guides: 471,
    devices: 320,
    topicHubs: 0,
    color: "bg-red-500",
    description:
      "Step-by-step guides and verified menu paths for Huawei devices running EMUI and HarmonyOS. Interactive live simulator included.",
    productLines: [
      { name: "Smartphone", count: 471, href: "/huawei/smartphone" },
    ],
    topGuides: [
      { title: "Enable Developer Options", href: "/huawei/smartphone/developer-options", category: "System & Settings" },
      { title: "Set Up Private DNS", href: "/huawei/smartphone/private-dns", category: "Network & Connectivity" },
      { title: "Turn On Always On Display", href: "/huawei/smartphone/always-on-display", category: "Display & Home Screen" },
      { title: "Manage App Permissions", href: "/huawei/smartphone/app-permissions", category: "Security & Privacy" },
      { title: "Battery Optimization Settings", href: "/huawei/smartphone/battery-optimization", category: "Battery & Power" },
      { title: "Change Navigation Gestures", href: "/huawei/smartphone/navigation-gestures", category: "System & Settings" },
    ],
    devicesList: [
      { name: "Huawei P60 Pro", os: "HarmonyOS 4", href: "/huawei/p60-pro" },
      { name: "Huawei Mate 60", os: "HarmonyOS 4", href: "/huawei/mate-60" },
      { name: "Huawei Nova 11", os: "HarmonyOS 3.1", href: "/huawei/nova-11" },
    ],
    forumTopics: [],
    seoText: {
      updates:
        "EMUI and HarmonyOS updates frequently rearrange settings menus. TapPath keeps paths verified against current builds.",
      help: "Practical guides for connectivity, battery, security and system settings with interactive simulation.",
    },
  },
  oneplus: {
    slug: "oneplus",
    name: "OnePlus",
    guides: 444,
    devices: 180,
    topicHubs: 0,
    color: "bg-red-600",
    description:
      "Verified step-by-step guides for OnePlus devices running OxygenOS. Live simulator mirrors the real menu structure.",
    productLines: [
      { name: "Smartphone", count: 444, href: "/oneplus/smartphone" },
    ],
    topGuides: [
      { title: "Enable Developer Options", href: "/oneplus/smartphone/developer-options", category: "System & Settings" },
      { title: "Zen Mode Setup", href: "/oneplus/smartphone/zen-mode", category: "Notifications & Focus" },
      { title: "Gaming Mode Settings", href: "/oneplus/smartphone/gaming-mode", category: "System & Settings" },
      { title: "Private DNS Configuration", href: "/oneplus/smartphone/private-dns", category: "Network & Connectivity" },
      { title: "Battery Optimization", href: "/oneplus/smartphone/battery-optimization", category: "Battery & Power" },
      { title: "Hide Notch / Camera Cutout", href: "/oneplus/smartphone/hide-notch", category: "Display & Home Screen" },
    ],
    devicesList: [
      { name: "OnePlus 12", os: "OxygenOS 14 / Android 14", href: "/oneplus/oneplus-12" },
      { name: "OnePlus 11", os: "OxygenOS 14 / Android 14", href: "/oneplus/oneplus-11" },
      { name: "OnePlus Nord 3", os: "OxygenOS 13", href: "/oneplus/nord-3" },
    ],
    forumTopics: [],
    seoText: {
      updates:
        "OxygenOS updates can move settings entries. TapPath keeps every path current and verified.",
      help: "Guides for connectivity, battery, gaming features and system options with live simulation.",
    },
  },
  oppo: {
    slug: "oppo",
    name: "Oppo",
    guides: 427,
    devices: 210,
    topicHubs: 0,
    color: "bg-green-500",
    description:
      "Step-by-step guides for Oppo devices running ColorOS. Interactive Live Simulator shows exact tap paths.",
    productLines: [
      { name: "Smartphone", count: 427, href: "/oppo/smartphone" },
    ],
    topGuides: [
      { title: "Enable Developer Options", href: "/oppo/smartphone/developer-options", category: "System & Settings" },
      { title: "App Lock Setup", href: "/oppo/smartphone/app-lock", category: "Security & Privacy" },
      { title: "Private DNS", href: "/oppo/smartphone/private-dns", category: "Network & Connectivity" },
      { title: "Battery Saver Modes", href: "/oppo/smartphone/battery-saver", category: "Battery & Power" },
      { title: "Always On Display", href: "/oppo/smartphone/always-on-display", category: "Display & Home Screen" },
      { title: "Game Assistant", href: "/oppo/smartphone/game-assistant", category: "System & Settings" },
    ],
    devicesList: [
      { name: "Oppo Find X7", os: "ColorOS 14 / Android 14", href: "/oppo/find-x7" },
      { name: "Oppo Reno 11", os: "ColorOS 14", href: "/oppo/reno-11" },
      { name: "Oppo A78", os: "ColorOS 13", href: "/oppo/a78" },
    ],
    forumTopics: [],
    seoText: {
      updates:
        "ColorOS updates regularly change menu locations. TapPath maintains verified paths for each version.",
      help: "Practical help for setup, network, battery and security with interactive simulation.",
    },
  },
  realme: {
    slug: "realme",
    name: "Realme",
    guides: 353,
    devices: 190,
    topicHubs: 67,
    color: "bg-yellow-500",
    description:
      "Interactive guides for Realme devices running Realme UI. High number of topic hubs and community activity.",
    productLines: [
      { name: "Smartphone", count: 353, href: "/realme/smartphone" },
    ],
    topGuides: [
      { title: "Developer Options Explained", href: "/realme/smartphone/developer-options", category: "System & Settings" },
      { title: "App Lock: Protecting Individual Apps", href: "/realme/smartphone/app-lock", category: "Security & Privacy" },
      { title: "Status Bar Settings & Icons", href: "/realme/smartphone/status-bar", category: "Display & Home Screen" },
      { title: "Multiple User Accounts & Guest Mode", href: "/realme/smartphone/multiple-users", category: "System & Settings" },
      { title: "VoLTE Setup", href: "/realme/smartphone/volte", category: "Network & Connectivity" },
      { title: "Game Space Settings", href: "/realme/smartphone/game-space", category: "System & Settings" },
    ],
    devicesList: [
      { name: "Realme GT 5 Pro", os: "Realme UI 5 / Android 14", href: "/realme/gt-5-pro" },
      { name: "Realme 12 Pro+", os: "Realme UI 5", href: "/realme/12-pro-plus" },
      { name: "Realme C55", os: "Realme UI 4", href: "/realme/c55" },
      { name: "Realme 10 Pro+", os: "Realme UI 4", href: "/realme/10-pro-plus" },
    ],
    forumTopics: [
      { title: "VoLte Realme C25Y", device: "Realme C25Y", author: "Dine Rauf", date: "15 Sep 2026", views: 384, replies: 0, href: "/forum/realme/c25y/volte" },
      { title: "I will try new phone Realme 10 Pro+", device: "Realme 10 Pro+", author: "Neelam Rajput", date: "31 Aug 2026", views: 514, replies: 0, href: "/forum/realme/10-pro/i-will-try-new-phone" },
    ],
    seoText: {
      updates:
        "Realme UI updates move settings frequently. TapPath keeps guides versioned and accurate.",
      help: "Extensive topic hubs plus step-by-step visual paths for every major setting.",
    },
  },
  android: {
    slug: "android",
    name: "Android",
    guides: 326,
    devices: 0,
    topicHubs: 1,
    color: "bg-emerald-500",
    description:
      "Generic Android (AOSP / stock) step-by-step guides. Useful when your OEM skin closely follows pure Android.",
    productLines: [
      { name: "Stock Android", count: 326, href: "/android/stock" },
    ],
    topGuides: [
      { title: "Enable Developer Options", href: "/android/stock/developer-options", category: "System & Settings" },
      { title: "Set Private DNS", href: "/android/stock/private-dns", category: "Network & Connectivity" },
      { title: "Manage App Permissions", href: "/android/stock/app-permissions", category: "Security & Privacy" },
      { title: "Battery Optimization", href: "/android/stock/battery-optimization", category: "Battery & Power" },
      { title: "Always On Display", href: "/android/stock/always-on-display", category: "Display & Home Screen" },
    ],
    devicesList: [],
    forumTopics: [],
    seoText: {
      updates:
        "Stock Android paths change with major version releases. Guides are tagged by Android version.",
      help: "Core system, network, battery and security guides that apply across many devices.",
    },
  },
  google: {
    slug: "google",
    name: "Google",
    guides: 120,
    devices: 40,
    topicHubs: 1,
    color: "bg-blue-600",
    description:
      "Guides for Google Pixel devices running pure Android / Pixel UI. Clean paths and versioned content.",
    productLines: [
      { name: "Pixel", count: 120, href: "/google/pixel" },
    ],
    topGuides: [
      { title: "Pixel Settings, Tools and Troubleshooting", href: "/google/pixel/pixel-help", category: "System & Settings" },
      { title: "Enable Developer Options", href: "/google/pixel/developer-options", category: "System & Settings" },
      { title: "Private DNS", href: "/google/pixel/private-dns", category: "Network & Connectivity" },
      { title: "Adaptive Battery", href: "/google/pixel/adaptive-battery", category: "Battery & Power" },
      { title: "Now Playing", href: "/google/pixel/now-playing", category: "System & Settings" },
    ],
    devicesList: [
      { name: "Pixel 9 Pro", os: "Android 15", href: "/google/pixel-9-pro" },
      { name: "Pixel 8 Pro", os: "Android 15", href: "/google/pixel-8-pro" },
      { name: "Pixel 7a", os: "Android 14", href: "/google/pixel-7a" },
    ],
    forumTopics: [],
    seoText: {
      updates:
        "Pixel Feature Drops and Android version upgrades can move settings. Paths stay verified.",
      help: "Clean, stock-Android focused guides with live simulation for Pixel devices.",
    },
  },
};

export const brandList = Object.values(brands);
