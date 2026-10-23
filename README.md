# TapPath

**Visual step-by-step smartphone settings guides with interactive Live Simulator.**

## Stack

Next.js 15 · TypeScript · Tailwind · Lucide

```bash
npm install && npm run dev
```

Env (optional):
- `NEXT_PUBLIC_SITE_URL` — canonical site URL
- `OPENAI_API_KEY` — real LLM for Copilot (`OPENAI_MODEL` optional)

## Implemented

- Homepage, brands (8), guides + Live Simulator
- Topics (14), devices, glossary (50+)
- Auth sessions (demo accounts)
- AI Copilot + `/api/copilot`
- SEO (sitemap, robots, HowTo JSON-LD)
- i18n EN/DE
- Admin dashboard (admin-gated)
- Community Forum

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| admin@tappath.com | admin1234 | admin |
| user@tappath.com | user1234 | user |

### Key routes

`/` · `/samsung` · `/topics` · `/devices` · `/glossary` · `/forum` · `/sign-in` · `/admin` · `/samsung/galaxy/remove-google-search-bar` · `/samsung/galaxy/battery-percentage`

## License

Private / All rights reserved for now.
