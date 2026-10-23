import Link from "next/link";
import type { Brand } from "@/data/brands";
import { BookOpen, Smartphone, Layers, MessageSquare, ChevronRight } from "lucide-react";

type Props = {
  brand: Brand;
};

export default function BrandPage({ brand }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">{brand.name}</span>
      </nav>

      <div className="mb-12">
        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${brand.color} text-white`}>
            <Smartphone className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{brand.name}</h1>
            <p className="mt-1 text-[var(--muted-foreground)]">
              Guides, help & settings · Live Simulator ready
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-lg text-[var(--muted-foreground)]">{brand.description}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Guides</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{brand.guides}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Devices</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{brand.devices || "—"}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Topic hubs</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{brand.topicHubs || "—"}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          <section>
            <h2 className="text-xl font-bold tracking-tight">Product lines</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Pick a series or platform for matching guides.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {brand.productLines.map((pl) => (
                <Link
                  key={pl.href}
                  href={pl.href}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
                >
                  <div>
                    <div className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      {pl.name}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {pl.count} content items
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] group-hover:bg-brand-100 group-hover:text-brand-700 dark:group-hover:bg-brand-900 dark:group-hover:text-brand-300">
                    Open
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold tracking-tight">Top guides</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              The most-read help for this brand.
            </p>
            <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              {brand.topGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[var(--muted)]/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{g.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{g.category}</div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-brand-600 dark:text-brand-400">
                      Open →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6">
            <h2 className="text-lg font-bold tracking-tight">
              {brand.name} Guides & Help at TapPath
            </h2>
            <div className="mt-4 space-y-4 text-[var(--muted-foreground)]">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  {brand.name} System Updates
                </h3>
                <p className="mt-1 text-sm leading-relaxed">{brand.seoText.updates}</p>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">
                  Help & Solutions for {brand.name} Devices
                </h3>
                <p className="mt-1 text-sm leading-relaxed">{brand.seoText.help}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          {brand.devicesList.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">Devices</h2>
                <Link
                  href={`/${brand.slug}/devices`}
                  className="text-sm font-medium text-brand-600 dark:text-brand-400"
                >
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {brand.devicesList.map((d) => (
                  <li key={d.href}>
                    <Link
                      href={d.href}
                      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 transition hover:border-brand-300 dark:hover:border-brand-700"
                    >
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{d.os}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <MessageSquare className="h-5 w-5" />
                Forum
              </h2>
              <Link
                href={`/forum/${brand.slug}`}
                className="text-sm font-medium text-brand-600 dark:text-brand-400"
              >
                All topics
              </Link>
            </div>
            {brand.forumTopics.length > 0 ? (
              <ul className="space-y-3">
                {brand.forumTopics.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition hover:border-brand-300 dark:hover:border-brand-700"
                    >
                      <div className="text-sm font-medium leading-snug">{t.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted-foreground)]">
                        <span>{t.device}</span>
                        <span>·</span>
                        <span>{t.author}</span>
                        <span>·</span>
                        <span>{t.date}</span>
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {t.views.toLocaleString()} views · {t.replies} replies
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--muted-foreground)]">
                No recent topics yet.
                <Link
                  href={`/forum/${brand.slug}`}
                  className="mt-2 block font-medium text-brand-600 dark:text-brand-400"
                >
                  Start a discussion →
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="text-sm font-semibold">Explore topics</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                { name: "Network & Connectivity", href: "/topics/network" },
                { name: "Display & Home Screen", href: "/topics/display" },
                { name: "Battery & Power", href: "/topics/battery" },
                { name: "Security & Privacy", href: "/topics/security" },
                { name: "All topics", href: "/topics" },
              ].map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="text-[var(--muted-foreground)] transition hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
