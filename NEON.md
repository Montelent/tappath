# Neon setup for TapPath

1. Run `neon/schema.sql` in **Neon → SQL Editor**. For an existing database, review and apply any needed additive changes before deployment.
2. Vercel → Settings → Environment Variables:
   - `DATABASE_URL` = your pooled Neon connection string
   - `AUTH_SECRET` = cryptographically random string (at least 32 characters)
   - `SETUP_SECRET` = separate cryptographically random string (at least 32 characters)
3. Redeploy
4. Create an account through the registration page.
5. Grant admin access only through a trusted database/admin workflow.
6. To verify the database connection and table counts, POST to `/api/setup` with the `x-setup-secret` header. This endpoint does not insert bundled sample content. Create live content in Admin.

The app uses `@neondatabase/serverless` when `DATABASE_URL` is set. Static starter data and in-memory storage are development-only; production routes do not fall back to mock content or accounts.
