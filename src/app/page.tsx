import Link from "next/link";
import HeroPhone from "@/components/HeroPhone";
import { Search, Smartphone, Layers, BookOpen, Users } from "lucide-react";

const brands = [
  { name: "Samsung", guides: 558, href: "/samsung", color: "bg-blue-500" },
  { name: "Xiaomi", guides: 556, href: "/xiaomi", color: "bg-orange-500" },
  { name: "Huawei", guides: 471, href: "/huawei", color: "bg-red-500" },
  { name: "OnePlus", guides: 444, href: "/oneplus", color: "bg-red-600" },
  { name: "Oppo", guides: 427, href: "/oppo", color: "bg-green-500" },
  { name: "Realme", guides: 353, href: "/realme", color: "bg-yellow-500" },
  { name: "Android", guides: 326, href: "/android", color: "bg-emerald-500" },
  { name: "Google", guides: 120, href: "/google", color: "bg-blue-600" },
];

const popularTopics = [
  {
    brand: "Xiaomi",
    title: "Split Screen on Xiaomi Phones",
    href: "/xiaomi/smartphone/split-screen",
  },
  {
    brand: "Realme",
    title: "Developer Options Explained",
    href: "/realme/smartphone/developer-options",
  },
  {
    brand: "Google",
    title: "Pixel Settings, Tools and Troubleshooting",
    href: "/google/pixel/pixel-help",
  },
  {
    brand: "Realme",
    title: "App Lock: Protecting Individual Apps",
    href: "/realme/smartphone/app-lock",
  },
  {
    brand: "Realme",
    title: "Status Bar Settings & Icons",
    href: "/realme/smartphone/status-bar",
  },
  {
    brand: "Realme",
    title: "Multiple User Accounts & Guest Mode",
    href: "/realme/smartphone/multiple-users",
  },
];

const stats = [
  { label: "Guides", value: "3,100+", icon: BookOpen },
  { label: "Topic Hubs", value: "71", icon: Layers },
  { label: "Brands", value: "8", icon: Smartphone },
  { label: "Devices", value: "4,600+", icon: Users },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-brand-50/80 to-transparent dark:from-brand-950/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              TapPath · Premium Hub
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Tech help{" "}
              <span className="bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent">
                you can see
              </span>
              .
            </h1>

            <p className="mt-5 max-w-xl text-lg text-[var(--muted-foreground)]">
              3,100+ interactive guides for 8 brands – step by step, visual, accurate.
              No hallucinated menu paths — curated click solutions.
            </p>

            <div className="mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm">
              <Search className="ml-3 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
              <input
                type="search"
                placeholder="Search brands or devices (e.g. Samsung, Galaxy S24)..."
                className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
              />
              <kbd className="hidden rounded border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] sm:inline">
                /
              </kbd>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#brands"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Smartphone className="h-4 w-4" />
                Choose a brand
              </Link>
              <Link
                href="/devices"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]"
              >
                Find a product
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--muted)]"
              >
                Popular topics →
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroPhone />
          </div>
        </div>

        <div className="relative border-t border-[var(--border)] bg-[var(--card)]/60 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="brands" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose a brand</h2>
            <p className="mt-1 text-[var(--muted-foreground)]">8 / 8 brands with verified guides</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 hover:shadow-lg dark:hover:border-brand-700"
            >
              <div className={`mb-3 h-10 w-10 rounded-xl ${b.color} opacity-90`} />
              <h3 className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {b.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {b.guides} guides · Topic hubs
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--muted)]/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular topics</h2>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Cross-brand guides for the most important smartphone settings
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTopics.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {t.brand}
                </span>
                <h3 className="mt-2 font-semibold">{t.title}</h3>
                <span className="mt-3 inline-block text-sm text-[var(--muted-foreground)]">
                  Open topic →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          No more guessing menu paths.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Pick your brand and follow the visual tap path – live simulated, always up to date.
        </p>
        <Link
          href="#brands"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-base font-medium text-white transition hover:bg-brand-700"
        >
          Find a solution now
        </Link>
      </section>
    </>
  );
}
