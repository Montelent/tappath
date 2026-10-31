import { getSiteSettings } from "@/lib/site-settings";

export default async function AuthorBox() {
  const s = await getSiteSettings();
  const name = (s.author_name || "").trim();
  if (!name) return null;

  const title = (s.author_title || "").trim();
  const bio = (s.author_bio || "").trim();
  const avatar = (s.author_avatar_url || "").trim();
  const sameAs = (s.author_same_as || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"
      aria-label="About the author"
    >
      <p className="label-caps mb-3">Written & verified by</p>
      <div className="flex gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover border border-[var(--border)]"
            width={56}
            height={56}
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            aria-hidden
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold tracking-tight">{name}</p>
          {title && (
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{title}</p>
          )}
          {bio && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {bio}
            </p>
          )}
          {sameAs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {sameAs.map((href) => {
                let label = href;
                try {
                  label = new URL(href).hostname.replace(/^www\./, "");
                } catch {
                  /* keep raw */
                }
                return (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
