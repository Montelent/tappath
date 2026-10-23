export type GlossaryTerm = {
  slug: string;
  term: string;
  category: string;
  short: string;
  definition: string;
  relatedGuides?: { title: string; href: string }[];
};

export const glossaryCategories = [
  "All",
  "Network",
  "System",
  "Battery",
  "Security",
  "Display",
  "Camera",
  "Messaging",
] as const;

export type GlossaryCategory = (typeof glossaryCategories)[number];

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "nfc",
    term: "NFC",
    category: "Network",
    short: "Near Field Communication for short-range wireless data exchange.",
    definition:
      "NFC (Near Field Communication) is a short-range wireless technology for data exchange over a few centimeters. It is used for contactless payments, transit cards, and pairing devices.",
  },
  {
    slug: "volte",
    term: "VoLTE",
    category: "Network",
    short: "Voice over LTE — calls over the 4G network instead of 2G/3G.",
    definition:
      "VoLTE (Voice over LTE) carries voice calls over the 4G network instead of the older 2G/3G circuit-switched network. It enables higher call quality and simultaneous voice and data.",
  },
  {
    slug: "esim",
    term: "eSIM",
    category: "Network",
    short: "Embedded SIM chip that replaces a physical SIM card.",
    definition:
      "An eSIM (embedded SIM) is a built-in chip inside a smartphone that replaces a physical SIM card. Mobile plans are activated digitally via QR code or app, without needing a SIM tray.",
  },
  {
    slug: "vpn",
    term: "VPN",
    category: "Network",
    short: "Encrypts your connection and routes it through an external server.",
    definition:
      "A VPN (Virtual Private Network) encrypts your internet connection and routes it through an external server. It helps protect privacy on public Wi‑Fi and can bypass some geographic restrictions.",
  },
  {
    slug: "5g",
    term: "5G",
    category: "Network",
    short: "Fifth generation of mobile networks — higher speeds, lower latency.",
    definition:
      "5G is the fifth generation of mobile networks, offering higher speeds, lower latency, and greater capacity than 4G/LTE. Not all areas or devices support every 5G band.",
  },
  {
    slug: "apn",
    term: "APN (Access Point Name)",
    category: "Network",
    short: "Settings that let your phone access the carrier’s mobile data network.",
    definition:
      "An APN is a configuration setting that gives a smartphone access to a carrier's mobile data network. Without the correct APN, mobile internet and MMS may not work properly.",
  },
  {
    slug: "dual-sim",
    term: "Dual-SIM",
    category: "Network",
    short: "Two SIM cards (or eSIM + physical) in one device.",
    definition:
      "Dual-SIM refers to smartphones that can manage two SIM cards at the same time. This lets you use two phone numbers or plans — for example personal and business — in one device.",
  },
  {
    slug: "bluetooth-le",
    term: "Bluetooth LE",
    category: "Network",
    short: "Low-energy Bluetooth for power-efficient wireless connections.",
    definition:
      "Bluetooth LE (Low Energy) is a power-efficient wireless standard for connecting devices like smartphones, smartwatches, or earbuds. It transmits small amounts of data with minimal power draw.",
  },
  {
    slug: "passkey",
    term: "Passkey",
    category: "Security",
    short: "Cryptographic login that replaces passwords.",
    definition:
      "A passkey is a cryptographic login credential that replaces passwords. It uses public-key cryptography tied to your device and biometrics, reducing phishing risk.",
  },
  {
    slug: "biometrics",
    term: "Biometrics",
    category: "Security",
    short: "Fingerprint, face, or other physical traits for authentication.",
    definition:
      "Biometrics identifies people using unique physical traits like fingerprints or facial features. On smartphones, it enables secure unlocking and authentication without passwords.",
  },
  {
    slug: "knox",
    term: "Knox",
    category: "Security",
    short: "Samsung’s multi-layered security platform for Galaxy devices.",
    definition:
      "Knox is Samsung's multi-layered security platform for Galaxy devices. It protects hardware, firmware, and software from tampering and isolates sensitive data using encryption and container technology.",
  },
  {
    slug: "encryption",
    term: "Encryption",
    category: "Security",
    short: "Transforms data into unreadable code without the correct key.",
    definition:
      "Encryption transforms data into unreadable code using an algorithm, decodable only with the correct key. It protects messages, files, and stored data on your smartphone from unauthorized access.",
  },
  {
    slug: "in-display-fingerprint",
    term: "In-Display Fingerprint Sensor",
    category: "Security",
    short: "Fingerprint reader built under the screen.",
    definition:
      "An in-display fingerprint sensor is a biometric scanner built directly beneath the screen. It reads fingerprints optically or via ultrasound, eliminating the need for a separate physical sensor.",
  },
  {
    slug: "app-permissions",
    term: "App Permissions",
    category: "Security",
    short: "Controls which system functions and data an app can access.",
    definition:
      "App permissions define which system functions and data an app can access on a smartphone, such as camera, location, or contacts. Users must actively grant these permissions on Android and iOS.",
  },
  {
    slug: "drm",
    term: "DRM (Digital Rights Management)",
    category: "Security",
    short: "Technical protection that restricts copying or unauthorized use of content.",
    definition:
      "DRM is a technical protection system that restricts copying, sharing, or unauthorized use of digital content like movies, music, or e-books. It controls who can access content and on which device.",
  },
  {
    slug: "amoled",
    term: "AMOLED / OLED",
    category: "Display",
    short: "Display tech where each pixel emits its own light — true blacks, high contrast.",
    definition:
      "AMOLED and OLED are display technologies where each pixel emits its own light, eliminating the need for a backlight. This enables true blacks, high contrast, and vivid colors, making them the standard for premium smartphones.",
  },
  {
    slug: "always-on-display",
    term: "Always-On Display",
    category: "Display",
    short: "Shows time and notifications with the screen mostly off.",
    definition:
      "An Always-On Display (AOD) permanently shows time, date, and notifications even when the phone is locked. Only select pixels light up while the rest stays black, saving battery compared to fully waking the screen on OLED panels.",
  },
  {
    slug: "adaptive-brightness",
    term: "Adaptive Brightness",
    category: "Display",
    short: "Automatically adjusts brightness based on ambient light.",
    definition:
      "Adaptive brightness automatically adjusts screen brightness based on ambient light. An ambient light sensor measures surrounding light levels, and the system adjusts display brightness accordingly.",
  },
  {
    slug: "dark-mode",
    term: "Dark Mode",
    category: "System",
    short: "Dark backgrounds and light text — easier on eyes and battery on OLED.",
    definition:
      "Dark Mode is a display setting that shows apps and the operating system with predominantly dark backgrounds and light text. It reduces screen brightness in low-light settings and can save battery on OLED displays.",
  },
  {
    slug: "gorilla-glass",
    term: "Gorilla Glass",
    category: "Display",
    short: "Chemically strengthened glass for scratch and drop resistance.",
    definition:
      "Gorilla Glass is a chemically strengthened glass made by Corning, used to protect smartphone screens from scratches and drops. It boosts durability without adding significant weight or thickness.",
  },
  {
    slug: "hdr10-plus",
    term: "HDR10+",
    category: "Display",
    short: "HDR standard with dynamic metadata per scene.",
    definition:
      "HDR10+ is an open HDR standard that uses dynamic metadata per scene or frame instead of fixed values for the whole video. This enables more precise brightness and contrast adjustments throughout playback.",
  },
  {
    slug: "lcd",
    term: "LCD",
    category: "Display",
    short: "Liquid crystal display with a separate backlight.",
    definition:
      "LCD (Liquid Crystal Display) is a display technology using liquid crystals to block or transmit light. Since pixels don't emit light themselves, a separate backlight is always required.",
  },
  {
    slug: "aspect-ratio",
    term: "Aspect Ratio",
    category: "Display",
    short: "Proportional relationship between screen width and height.",
    definition:
      "Aspect ratio describes the proportional relationship between a display's width and height, such as 19.5:9 or 20:9. It defines the screen's shape and affects how content like videos and apps is displayed.",
  },
  {
    slug: "ota-update",
    term: "OTA update",
    category: "System",
    short: "Software update delivered wirelessly to the device.",
    definition:
      "An OTA update is a software update delivered wirelessly ('Over The Air') directly to a smartphone. It can include security patches, bug fixes, and new features.",
  },
  {
    slug: "hyperos",
    term: "HyperOS / MIUI",
    category: "System",
    short: "Xiaomi’s Android skin — HyperOS succeeds MIUI.",
    definition:
      "HyperOS is Xiaomi's current Android skin, the successor to MIUI. It connects smartphones, tablets, wearables, and smart-home devices through a unified ecosystem operating system.",
  },
  {
    slug: "launcher",
    term: "Launcher",
    category: "System",
    short: "Software layer controlling the home screen and app drawer.",
    definition:
      "A launcher is the software layer that controls the home screen, app icons, widgets, and app drawer on an Android phone. It can be replaced to customize design, behavior, and features.",
  },
  {
    slug: "gesture-navigation",
    term: "Gesture navigation",
    category: "System",
    short: "Control the phone with swipes instead of navigation buttons.",
    definition:
      "Gesture navigation lets you control a smartphone through swipe and tap movements on the screen instead of physical buttons. It replaces traditional navigation keys like back, home, and recent apps.",
  },
  {
    slug: "bloatware",
    term: "Bloatware",
    category: "System",
    short: "Preinstalled apps you may not need and often can’t easily remove.",
    definition:
      "Bloatware refers to preinstalled apps on smartphones that most users don't need and often can't remove. They occupy storage, run in the background, and typically come from the manufacturer or carrier.",
  },
  {
    slug: "bootloader",
    term: "Bootloader",
    category: "System",
    short: "Small program that runs before the OS when the phone powers on.",
    definition:
      "A bootloader is a small program that runs before the operating system when a smartphone powers on, controlling how the OS is loaded. It decides which software is allowed to start.",
  },
  {
    slug: "apk",
    term: "APK",
    category: "System",
    short: "Android Package Kit — the install file format for Android apps.",
    definition:
      "APK (Android Package Kit) is the file format used to package and install Android apps. It bundles an app's code, resources, and permissions. APK files can be installed even outside the Play Store when allowed.",
  },
  {
    slug: "cache",
    term: "Cache",
    category: "System",
    short: "Temporary storage for frequently used data.",
    definition:
      "A cache is a temporary storage area that holds frequently used data for quick access. It speeds up apps and the system by avoiding repeated loading processes. Clearing cache can free space but may slow apps temporarily.",
  },
  {
    slug: "haptic-feedback",
    term: "Haptic Feedback",
    category: "System",
    short: "Vibrations that respond to touch and system events.",
    definition:
      "Haptic feedback refers to noticeable vibrations or force effects that a smartphone uses to respond to touch and system events. It provides tactile confirmation when tapping buttons or receiving notifications.",
  },
  {
    slug: "ios",
    term: "iOS",
    category: "System",
    short: "Apple’s mobile operating system for iPhone.",
    definition:
      "iOS is Apple's mobile operating system for iPhones. It manages hardware, apps, and the user interface, known for strong security, long-term software updates, and a closed ecosystem.",
  },
  {
    slug: "battery-health",
    term: "Battery Health",
    category: "Battery",
    short: "Current max capacity vs original, shown as a percentage.",
    definition:
      "Battery health indicates the current maximum charge capacity of a battery compared to its original state, shown as a percentage. It naturally declines with each charge cycle.",
  },
  {
    slug: "adaptive-battery",
    term: "Adaptive Battery",
    category: "Battery",
    short: "AI that limits background activity for rarely used apps.",
    definition:
      "Adaptive Battery is an AI feature that learns your app usage habits and restricts background activity for rarely used apps. This saves battery automatically without manual configuration.",
  },
  {
    slug: "charging-cycle",
    term: "Charging cycle",
    category: "Battery",
    short: "Full discharge and recharge from 0 to 100%.",
    definition:
      "A charging cycle refers to the complete discharge and recharge of a battery from 0 to 100 percent, regardless of whether this happens in one session or several partial charges. It is the key unit for measuring lithium-ion battery aging.",
  },
  {
    slug: "bypass-charging",
    term: "Bypass Charging",
    category: "Battery",
    short: "Power goes to the system instead of the battery while plugged in.",
    definition:
      "Bypass Charging routes power from the charger directly to the phone's system instead of the battery. This cuts heat buildup and battery wear, especially while gaming or streaming plugged in.",
  },
  {
    slug: "eis",
    term: "EIS (Electronic Image Stabilization)",
    category: "Camera",
    short: "Software-based shake reduction by shifting and cropping the frame.",
    definition:
      "EIS reduces camera shake through software by shifting and cropping the image frame. Unlike OIS, it uses no moving lens parts, relying instead on algorithms and gyroscope data.",
  },
  {
    slug: "geotagging",
    term: "Geotagging",
    category: "Camera",
    short: "Embedding GPS coordinates into photo or video metadata.",
    definition:
      "Geotagging is the automatic embedding of GPS coordinates into a photo's or video's metadata. It records the exact location where the shot was taken.",
  },
  {
    slug: "codec",
    term: "Codec",
    category: "Messaging",
    short: "Method for compressing and decompressing audio or video.",
    definition:
      "A codec is a method for compressing and decompressing audio or video data. It shrinks file sizes while keeping content playable. Common examples include AAC, MP3, H.264, and AV1.",
  },
  {
    slug: "heif-hevc",
    term: "HEIF / HEVC",
    category: "Messaging",
    short: "Modern image and video formats with efficient compression.",
    definition:
      "HEIF is a modern image format; HEVC (H.265) is a video codec. Both compress more efficiently than older standards like JPEG or H.264, saving significant storage space at comparable quality.",
  },
  {
    slug: "dolby-atmos",
    term: "Dolby Atmos",
    category: "Messaging",
    short: "Object-based surround sound with height information.",
    definition:
      "Dolby Atmos is a surround sound format that treats audio as individual objects instead of fixed channels. This creates three-dimensional sound with height information that adapts to headphones or speakers.",
  },
  {
    slug: "lossless-audio",
    term: "Lossless Audio",
    category: "Messaging",
    short: "Audio format with no quality loss from compression.",
    definition:
      "Lossless Audio refers to an audio format that compresses or stores music without any quality loss. Unlike MP3, no sound information is discarded, keeping the audio true to the original studio recording.",
  },
  {
    slug: "cloud-backup",
    term: "Cloud Backup",
    category: "Messaging",
    short: "Automatic storage of photos, contacts, and data on remote servers.",
    definition:
      "A cloud backup automatically stores photos, contacts, and app data on a provider's remote servers. This keeps data safe even if the device is lost and allows restoration on new devices.",
  },
  {
    slug: "imap-pop3",
    term: "IMAP / POP3",
    category: "Messaging",
    short: "Protocols for retrieving email from a server.",
    definition:
      "IMAP and POP3 are protocols for retrieving email from a server. IMAP keeps mail synced across devices, while POP3 downloads messages and often removes them from the server.",
  },
  {
    slug: "widget",
    term: "Widget",
    category: "System",
    short: "Interactive home-screen element that shows info or shortcuts.",
    definition:
      "A widget is a small interactive element on the home screen that displays information or provides shortcuts without opening a full app. Examples include weather, calendar, and the Google search bar.",
    relatedGuides: [
      {
        title: "Remove Google Search Bar from Home Screen",
        href: "/samsung/galaxy/remove-google-search-bar",
      },
    ],
  },
  {
    slug: "app-drawer",
    term: "App Drawer",
    category: "System",
    short: "Screen listing all installed apps, separate from the home screen.",
    definition:
      "The app drawer is a separate screen on Android devices that lists all installed apps, usually alphabetically, apart from the home screen. It keeps the home screen tidy while still giving quick access to every app.",
  },
  {
    slug: "dual-messenger",
    term: "Dual Messenger",
    category: "System",
    short: "Run a second instance of an app with a different account.",
    definition:
      "Dual Messenger is a smartphone feature that lets you run a second, independent instance of an app like WhatsApp with a different account. It keeps personal and work chats separate without constant logins.",
  },
  {
    slug: "ip-rating",
    term: "IP Rating",
    category: "Display",
    short: "Dust and water resistance rating (e.g. IP68).",
    definition:
      "IP rating indicates how well a smartphone is protected against dust and water ingress. It consists of two digits, such as IP68, showing dust and water resistance levels.",
  },
  {
    slug: "accessibility-features",
    term: "Accessibility features",
    category: "System",
    short: "Tools that make phones usable for people with impairments.",
    definition:
      "Accessibility features are system tools that make smartphones usable for people with visual, hearing, motor, or cognitive impairments. They include screen readers, magnification, captions, and alternative input methods.",
  },
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}

export function getTermsByCategory(category: string): GlossaryTerm[] {
  if (category === "All") return glossaryTerms;
  return glossaryTerms.filter((t) => t.category === category);
}

export function getTermsGroupedByLetter(): Record<string, GlossaryTerm[]> {
  const sorted = [...glossaryTerms].sort((a, b) =>
    a.term.localeCompare(b.term, undefined, { sensitivity: "base" })
  );
  const groups: Record<string, GlossaryTerm[]> = {};
  for (const t of sorted) {
    const letter = t.term.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
