import type { Metadata } from "next";
import Link from "next/link";
import {
  Wifi,
  Monitor,
  Battery,
  Shield,
  Bell,
  MessageSquare,
  Package,
  Camera,
  Settings,
  HardDrive,
  Accessibility,
  Cloud,
  Languages,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { topics } from "@/data/topics";

export const metadata: Metadata = {
  title: "Topic hubs — Guides & tips",
  description:
    "Cross-brand guides for the most important smartphone topics — grouped by category, filterable by brand.",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Monitor,
  Battery,
  Shield,
  Bell,
  MessageSquare,
  Package,
  Camera,
  Settings,
  HardDrive,
  Accessibility,
  Cloud,
  Languages,
  MoreHorizontal,
};

export default function TopicsIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">Topics</span>
      </nav>

      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Topic hubs</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Cross-brand guides for the most important smartphone topics — grouped by category,
          filterable by brand.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => {
          const Icon = iconMap[t.icon] ?? Settings;
          return (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {t.name}
              </h2>
              <p className="mt-1.5 flex-1 text-sm text-[var(--muted-foreground)] line-clamp-3">
                {t.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">{t.guideCount} guides</span>
                <span className="font-medium text-brand-600 dark:text-brand-400">
                  Open topic hub →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
