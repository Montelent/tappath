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
      {
        id: "oneui-5",
        label: "Android 13 · One UI 5",
        steps: [
          {
            id: 1,
            instruction: "Tap and hold the **Google Search Bar**",
            highlight: "Google Search Bar",
            detail: "Long-press the search widget.",
          },
          {
            id: 2,
            instruction: "Tap **Remove**",
            highlight: "Remove",
            detail: "Confirm removal from the menu.",
          },
        ],
      },
    ],
    article: [
      "The Google search bar on Samsung phones is a preinstalled widget, not a fixed system element. It ships pinned to the home screen so you get a shortcut for web searches and Google Assistant without opening the browser first.",
      "Because it is a normal widget, it behaves like any other one you place on your screen. That means you can move it, resize it, or remove it entirely without affecting the Google app itself or your search history.",
      "To remove it, tap and hold the widget until the option menu appears. From there use Tap and hold the Google Search Bar → Tap on Remove and it disappears from the home screen immediately.",
      "Removing the widget only clears it from your layout. Google Assistant, Google Search, and the Google app stay installed and fully functional, so you can still search or use voice commands through the app icon or another shortcut.",
      "If you actually use the search bar daily but want it out of the way, moving it to a secondary home screen panel is a better fix than removing it. That keeps the shortcut available without it sitting on your main screen.",
    ],
    faqs: [
      {
        q: "Does removing the Google search bar delete the Google app?",
        a: "No. The widget and the app are separate. Removing the widget only clears the home screen shortcut; the Google app stays installed.",
      },
      {
        q: "Can I add the Google search bar back later?",
        a: "Yes. Long-press an empty area on the home screen → Widgets → Google → drag the search bar back onto a panel.",
      },
      {
        q: "Will removing the widget affect Google Assistant?",
        a: "No. Google Assistant remains available via the app icon, the power button long-press (if enabled), or voice Hey Google.",
      },
      {
        q: "Why does the search bar come back after a restart or reset?",
        a: "Factory reset or some system updates can restore the default home-screen layout, which includes the Google search widget. Simply remove it again.",
      },
    ],
    related: [
      { title: "Change Always On Display Clock Style", href: "/samsung/galaxy/always-on-display-clock", category: "Display & Home Screen" },
      { title: "Restore Default Theme", href: "/samsung/galaxy/restore-default-theme", category: "Display & Home Screen" },
      { title: "Turn Screen Rotation On or Off", href: "/samsung/galaxy/screen-rotation", category: "Display & Home Screen" },
      { title: "Set Default Home Screen Launcher", href: "/samsung/galaxy/default-system-launcher", category: "Display & Home Screen" },
    ],
    compatibleDevices: [
      { name: "Samsung Galaxy S24 Ultra", os: "One UI 7 / Android 15", href: "/samsung/galaxy-s24-ultra" },
      { name: "Samsung Galaxy S23", os: "One UI 7 / Android 15", href: "/samsung/galaxy-s23" },
      { name: "Samsung Galaxy A55 5G", os: "One UI 6 / Android 14", href: "/samsung/galaxy-a55-5g" },
      { name: "Samsung Galaxy A35", os: "One UI 6 / Android 14", href: "/samsung/galaxy-a35" },
    ],
    confirmations: 84,
    forumVerified: true,
  },
};

export function getGuide(key: string): Guide | undefined {
  return guides[key];
}
