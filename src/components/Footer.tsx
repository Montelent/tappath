import Link from "next/link";

const brands = [
  { name: "Samsung", href: "/samsung" },
  { name: "Xiaomi", href: "/xiaomi" },
  { name: "Huawei", href: "/huawei" },
  { name: "OnePlus", href: "/oneplus" },
  { name: "Oppo", href: "/oppo" },
  { name: "Realme", href: "/realme" },
  { name: "Google", href: "/google" },
  { name: "Android", href: "/android" },
];

const topics = [
  { name: "Network & Connectivity", href: "/topics/network" },
  { name: "Display & Home Screen", href: "/topics/display" },
  { name: "Battery & Power", href: "/topics/battery" },
  { name: "Security & Privacy", href: "/topics/security" },
  { name: "Notifications & Focus", href: "/topics/notifications" },
  { name: "Calls & Messages", href: "/topics/messaging" },
];

const explore = [
  { name: "All Devices", href: "/devices" },
  { name: "Glossary", href: "/glossary" },
  { name: "Forum", href: "/forum" },
  { name: "Authors", href: "/authors" },
];

const legal = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Imprint", href: "/imprint" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <span className="text-sm font-bold">TP</span>
              </div>
              <span>
                Tap<span className="text-brand-600 dark:text-brand-400">Path</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Visual step-by-step help for smartphones — interactive, verified, and without hallucinated menu paths.
            </p>
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Live Simulator · Built for accuracy
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Brands</h3>
            <ul className="mt-3 space-y-2">
              {brands.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Topics</h3>
            <ul className="mt-3 space-y-2">
              {topics.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                    {t.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/topics" className="text-sm font-medium text-brand-600 dark:text-brand-400">
                  All topics →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-3 space-y-2">
              {explore.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                    {e.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} TapPath. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            *As an Amazon Partner we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
