# Supabase setup for TapPath

## 1. Create project

1. Go to https://supabase.com and create a project
2. Open **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

## 2. Run schema

Open **SQL Editor** → New query → paste contents of `supabase/schema.sql` → Run.

This creates tables for brands, topics, devices, glossary, guides, forum, feedback, profiles + RLS policies.

## 3. Env vars (Vercel + local `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AUTH_SECRET=long-random-string
```

## 4. Seed mock content

1. Deploy / run the app
2. Sign in as admin: `admin@tappath.com` / `admin1234`
3. Open `/admin/guides` (or any content page)
4. Click **Seed from mock data**

## 5. Edit frontend content

| Admin route | Edits |
|-------------|--------|
| `/admin` | Dashboard + counts |
| `/admin/guides` | Step-by-step guides (versions JSON, FAQs, article) |
| `/admin/brands` | Brand hubs |
| `/admin/topics` | Topic hubs |
| `/admin/devices` | Device directory |
| `/admin/glossary` | Glossary terms |
| `/admin/forum` | Forum topics |

Without Supabase env vars, the site keeps using static files under `src/data/`.

## Make a real Supabase admin user

After Auth is switched to Supabase Auth, promote a user:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```
