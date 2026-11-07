import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { createUser, findUserByEmail, publicUser } from "@/lib/db/users";
import { getSiteSettings } from "@/lib/site-settings";
import { isNeonConfigured } from "@/lib/db/neon";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!isNeonConfigured() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Authentication database is not configured." }, { status: 503 });
  }

  const rate = await enforceRateLimit(req, "register", 5, 3600);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: rate.unavailable ? "Service temporarily unavailable." : "Too many requests. Try again shortly." },
      { status: rate.unavailable ? 503 : 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const settings = await getSiteSettings();
  if (!settings.allow_signups) {
    return NextResponse.json({ error: "New account registration is currently disabled." }, { status: 403 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address (max 254 characters)." }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json({ error: "Name must be 80 characters or fewer." }, { status: 400 });
  }

  let existing: Awaited<ReturnType<typeof findUserByEmail>>;
  try {
    existing = await findUserByEmail(email);
  } catch (e) {
    console.error("[register:lookup]", e);
    return NextResponse.json({ error: "Registration service unavailable." }, { status: 503 });
  }
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  try {
    const user = await createUser({
      email,
      name: name || "User",
      password,
      role: "user",
    });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    console.error("[register:create]", e);
    return NextResponse.json({ error: "Registration service unavailable." }, { status: 503 });
  }
}
