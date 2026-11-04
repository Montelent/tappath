# Neon setup for TapPath

1. Apply the committed Neon schema/migration SQL in **Neon → SQL Editor** (see `neon/`).
2. Vercel → Settings → Environment Variables:
   - `DATABASE_URL` = your pooled Neon connection string
   - `AUTH_SECRET` = cryptographically random string (at least 32 characters)
   - `SETUP_SECRET` = separate cryptographically random string (at least 32 characters)
3. Redeploy
4. Create an account through the registration page.
5. Grant admin access only through a trusted database/admin workflow.
6. To seed initial content, POST to `/api/setup` with the `x-setup-secret` header.

The app uses `@neondatabase/serverless` when `DATABASE_URL` is set, otherwise mock files.
