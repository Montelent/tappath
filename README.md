# TapPath

**Visual step-by-step smartphone settings guides with interactive Live Simulator.**

Better, faster, more accurate than TechBone. Curated click paths, versioned, community-verified.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Lucide icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_SITE_URL` for production (defaults to `https://tappath.com`).

## Features Implemented

### v0.1 – Homepage + Layout
### v0.2 – Brand Pages (8 hubs)
### v0.3 – Guide pages + Live Simulator
### v0.4 – Topics system (14 hubs)
### v0.5 – Devices directory
### v0.6 – Glossary (50+ terms)
### v0.7 – Auth UI
### v0.8 – AI Copilot widget
### v0.9 – SEO (sitemap, robots, HowTo/FAQ JSON-LD)

### v0.10 – Multi-language (i18n)
- [x] EN + DE dictionaries for nav, home, guide, topics, devices, glossary, auth, copilot, footer
- [x] `LanguageProvider` with localStorage + browser language detection
- [x] `LanguageSwitcher` in header (desktop + mobile)
- [x] Header labels translated via `useT()`

## Remaining Features

1–10. ~~Done~~ ✅
11. **Content seeding + admin** ← next
12. Community Forum *(optional / skipped)*
13. Wire more pages fully to `useT()` (homepage body, Footer, Copilot strings)
14. Real auth provider + real LLM for copilot

## License

Private / All rights reserved for now.
