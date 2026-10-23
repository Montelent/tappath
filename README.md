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
- [x] Global Header / Footer
- [x] Homepage hero with animated phone mockup, stats, brand grid, topics, CTA

### v0.2 – Brand Pages
- [x] Shared BrandPage + data for 8 brands
- [x] Routes: `/samsung`, `/xiaomi`, `/huawei`, `/oneplus`, `/oppo`, `/realme`, `/android`, `/google`

### v0.3 – Guide pages + Live Simulator
- [x] Guide data model (versions, steps, FAQs, related, devices)
- [x] **LiveSimulator**: version selector, step highlight on phone UI, prev/next, fullscreen, path verified badge
- [x] GuideFeedback (Yes/No + confirmation count + forum verified)
- [x] GuideFAQ accordion
- [x] Full GuidePage layout (breadcrumb, article, related, sidebar)
- [x] Sample guide: `/samsung/galaxy/remove-google-search-bar`

## Remaining Features

1. ~~Brand pages~~ ✅
2. ~~Guide pages + Live Simulator~~ ✅
3. **Topics system** (`/topics`, `/topics/network`, …) ← next
4. Devices directory + device detail pages
5. Glossary (A–Z + categories)
6. Community Forum
7. Auth / Sign-in
8. AI Copilot widget
9. SEO (HowTo structured data, sitemap, performance)
10. Multi-language (i18n)
11. Content seeding + admin

## License

Private / All rights reserved for now.
