# Legacy Supabase notes — deprecated

TapPath no longer uses Supabase. The active production database is **Neon PostgreSQL**
through `DATABASE_URL` and `@neondatabase/serverless`.

- Do not configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY`.
- Do not run `supabase/schema.sql` for the active application.
- Do not use the old demo credentials or static seeding instructions previously documented here.
- Production authentication, content, forum, feedback, and rate limiting require Neon.
- Bundled files under `src/data` are local-development fixtures only; production routes do not fall back to them.

For current setup instructions, use [NEON.md](./NEON.md) and [neon/schema.sql](./neon/schema.sql).
