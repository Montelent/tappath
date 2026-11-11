import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, House, Search, Smartphone } from "lucide-react";

const destinations = [
  { href: "/search", label: "Search guides", description: "Find a step-by-step fix", icon: Search },
  { href: "/devices", label: "Browse devices", description: "Explore phones and brands", icon: Smartphone },
  { href: "/topics", label: "Explore topics", description: "Discover settings and features", icon: Compass },
];

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[68vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.045] blur-3xl" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          Error 404 · Lost connection
        </div>

        <div className="relative mx-auto mb-7 flex h-44 w-64 items-center justify-center sm:h-52 sm:w-80">
          <div aria-hidden="true" className="absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.08] blur-2xl" />
          <div className="relative flex items-center gap-1 font-mono text-[7.5rem] font-semibold leading-none tracking-[-0.12em] text-[var(--foreground)] sm:text-[9rem]">
            <span>4</span>
            <span className="relative mx-1 flex h-[0.82em] w-[0.82em] items-center justify-center rounded-[1.1rem] border-[5px] border-[var(--accent)] bg-[var(--card)] text-[var(--accent)] shadow-[0_12px_40px_var(--accent-muted)] sm:rounded-[1.35rem]">
              <Smartphone className="h-[0.39em] w-[0.39em] stroke-[1.8]" />
              <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-4 border-[var(--background)] bg-[var(--accent)]" />
            </span>
            <span>4</span>
          </div>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.28em] text-[var(--muted-foreground)]">ROUTE NOT FOUND</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Looks like you took a wrong turn.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          The page you’re looking for may have moved, been renamed, or no longer exists.
          Let’s get you back on the right path.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_var(--accent-muted)] transition hover:-translate-y-0.5 hover:opacity-90 sm:w-auto">
            <House className="h-4 w-4" /> Back to homepage <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/search" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:w-auto">
            <Search className="h-4 w-4" /> Find a guide
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-3xl border-t border-[var(--border)] pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Or explore somewhere useful</p>
          <div className="grid gap-3 text-left sm:grid-cols-3">
            {destinations.map(({ href, label, description, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--foreground)]">{label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        </div>

        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--accent)]">
          <ArrowLeft className="h-4 w-4" /> Return to TapPath
        </Link>
      </div>
    </main>
  );
}
