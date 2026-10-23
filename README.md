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

## Features Implemented

### v0.1 – Homepage + Layout
- [x] Project scaffold + Tailwind + dark mode
- [x] Global Header (nav, language, dark toggle, Sign In, mobile menu)
- [x] Global Footer (brands, topics, explore, legal)
- [x] Homepage hero with animated Live Simulator phone mockup
- [x] Stats bar, brand grid, popular topics, CTA

### v0.2 – Brand Pages
- [x] Shared `BrandPage` component
- [x] Brand data for all 8 brands (Samsung, Xiaomi, Huawei, OnePlus, Oppo, Realme, Android, Google)
- [x] Routes: `/samsung`, `/xiaomi`, `/huawei`, `/oneplus`, `/oppo`, `/realme`, `/android`, `/google`
- [x] Product lines, top guides, devices list, forum teaser, SEO content blocks

## Remaining Features (implementation order)

1. ~~Brand pages~~ ✅
2. **Individual Guide pages + full Interactive Live Simulator** (step highlighting, version selector, feedback, FAQs) ← next
3. Topics system (`/topics`, `/topics/network`, …) + cross-brand filters
4. Devices directory + device detail pages
5. Glossary (A–Z + categories)
6. Community Forum (categories, topics, solutions, leaderboard)
7. Auth / Sign-in / user accounts
8. AI Copilot chat widget
9. SEO (HowTo structured data, sitemap, OpenGraph, performance)
10. Multi-language (i18n EN/DE first)
11. Content seeding + simple admin / CMS hooks

## License

Private / All rights reserved for now.
