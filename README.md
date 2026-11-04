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
- Auth sessions (account registration; requires AUTH_SECRET)
- AI Copilot + `/api/copilot`
- SEO (sitemap, robots, HowTo JSON-LD)
- i18n EN/DE
- Admin dashboard (admin-gated)
- Community Forum

### Production configuration

Set `AUTH_SECRET` to a cryptographically random value of at least 32 characters.
Do not rely on demo credentials or mock storage for production deployments.
For Neon deployments, configure `DATABASE_URL`; the protected content bootstrap
also requires a one-time `SETUP_SECRET` of at least 32 characters, sent as the
`x-setup-secret` header. The bootstrap seeds content only and never creates or
resets user accounts.

### Key routes

`/` · `/samsung` · `/topics` · `/devices` · `/glossary` · `/forum` · `/sign-in` · `/admin` · `/samsung/galaxy/remove-google-search-bar` · `/samsung/galaxy/battery-percentage`

## License

Private / All rights reserved for now.
