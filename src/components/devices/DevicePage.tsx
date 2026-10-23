import Link from "next/link";
import { ChevronRight, Smartphone, BookOpen } from "lucide-react";
import type { Device } from "@/data/devices";

type Props = {
  device: Device;
};

export default function DevicePage({ device }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/devices" className="hover:text-[var(--foreground)]">
          Devices
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${device.brandSlug}`} className="hover:text-[var(--foreground)]">
          {device.brand}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)] line-clamp-1">{device.name}</span>
      </nav>

      <header className="mb-10">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Smartphone className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
              {device.brand}
              {device.series ? ` · ${device.series}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {device.name}
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">{device.os}</p>
            {device.year && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Released {device.year}
              </p>
            )}
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-lg text-[var(--muted-foreground)]">
          {device.description}
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <BookOpen className="h-5 w-5" />
              Guides for this device
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Verified menu paths that apply to {device.name}.
            </p>
            {device.guides.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
                No device-specific guides listed yet. Browse{" "}
                <Link
                  href={`/${device.brandSlug}`}
                  className="font-medium text-brand-600 dark:text-brand-400"
                >
                  all {device.brand} guides
                </Link>
                .
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                {device.guides.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[var(--muted)]/50"
                    >
                      <div>
                        <div className="font-medium">{g.title}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {g.category}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                        Open →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-6">
            <h2 className="text-lg font-bold tracking-tight">
              More {device.brand} help
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Explore all product lines, top guides and community discussions for{" "}
              {device.brand}.
            </p>
            <Link
              href={`/${device.brandSlug}`}
              className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              View {device.brand} hub →
            </Link>
          </section>
        </div>

        <aside className="space-y-6">
          {device.relatedDevices.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Related devices
              </h3>
              <ul className="space-y-2">
                {device.relatedDevices.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 transition hover:border-brand-300 dark:hover:border-brand-700"
                    >
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{r.os}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="text-sm font-semibold">Browse</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li>
                <Link
                  href="/devices"
                  className="text-[var(--muted-foreground)] transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  All devices
                </Link>
              </li>
              <li>
                <Link
                  href={`/${device.brandSlug}`}
                  className="text-[var(--muted-foreground)] transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {device.brand} brand page
                </Link>
              </li>
              <li>
                <Link
                  href="/topics"
                  className="text-[var(--muted-foreground)] transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Topic hubs
                </Link>
              </li>
              <li>
                <Link
                  href={`/forum/${device.brandSlug}`}
                  className="text-[var(--muted-foreground)] transition hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {device.brand} forum
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
