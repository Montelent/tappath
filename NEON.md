# Neon setup for TapPath

1. Run the Neon schema SQL (previous message) in **Neon → SQL Editor**
2. Vercel → Settings → Environment Variables:
   - `DATABASE_URL` = your pooled Neon connection string
   - `AUTH_SECRET` = long random string
3. Redeploy
4. Sign in: `admin@tappath.com` / `admin1234`
5. Open `/admin/guides` → **Seed from mock data**

The app uses `@neondatabase/serverless` when `DATABASE_URL` is set, otherwise mock files.
