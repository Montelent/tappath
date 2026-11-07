import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { createUser, findUserByEmail, publicUser } from "@/lib/db/users";
import { getSiteSettings } from "@/lib/site-settings";
import { isNeonConfigured } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  if (!isNeonConfigured() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Authentication database is not configured." }, { status: 503 });
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

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
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
    const msg = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
