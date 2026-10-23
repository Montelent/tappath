# TapPath

**Visual step-by-step smartphone settings guides with interactive Live Simulator.**

Better, faster, more accurate than TechBone. Curated click paths, versioned, community-verified.

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · Lucide icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_SITE_URL` for production (defaults to `https://tappath.com`).

## Features Implemented (v0.1 → v0.11)

| Area | Status |
|------|--------|
| Homepage + layout | ✅ |
| Brand pages (8) | ✅ |
| Guide pages + Live Simulator | ✅ |
| Topics (14 hubs) | ✅ |
| Devices directory | ✅ |
| Glossary (50+ terms) | ✅ |
| Auth UI | ✅ |
| AI Copilot widget | ✅ |
| SEO (sitemap, robots, HowTo JSON-LD) | ✅ |
| i18n EN/DE | ✅ |
| Content seed + Admin dashboard | ✅ |

### Admin

- `/admin` — counts, full content table, how-to-seed notes (noindex)
- `/admin/guides` · `/admin/devices` · `/admin/glossary`
- Content source of truth: `src/data/*`

## Optional next steps

- Community Forum
- Wire more pages to `useT()` (homepage body, Footer, Copilot)
- Real auth (Clerk / Auth.js / Supabase)
- Real LLM behind the Copilot
- Expand guide seed content at scale
- Protect `/admin` with real auth

## License

Private / All rights reserved for now.
