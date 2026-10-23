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
- [x] Guide data model, LiveSimulator, Feedback, FAQ, GuidePage
- [x] Sample: `/samsung/galaxy/remove-google-search-bar`

### v0.4 – Topics system
- [x] 14 topic hubs (Network, Display, Battery, Security, Notifications, Messaging, Apps, Media, System, Storage, Accessibility, Accounts, Language & Input, Other)
- [x] `/topics` index with icons + guide counts
- [x] TopicHub with brand filter, guides by brand, FAQs, sidebar
- [x] Routes: `/topics/network`, `/topics/display`, …

## Remaining Features

1. ~~Brand pages~~ ✅
2. ~~Guide pages + Live Simulator~~ ✅
3. ~~Topics system~~ ✅
4. **Devices directory + device detail pages** ← next
5. Glossary (A–Z + categories)
6. Community Forum
7. Auth / Sign-in
8. AI Copilot widget
9. SEO (HowTo structured data, sitemap, performance)
10. Multi-language (i18n)
11. Content seeding + admin

## License

Private / All rights reserved for now.
