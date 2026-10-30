import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { authenticateUser, ensureDemoUsers, publicUser } from "@/lib/db/users";
import { isNeonConfigured } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  try {
    if (isNeonConfigured()) await ensureDemoUsers();
  } catch {
    /* schema may not exist yet */
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json(
      {
        error: "Invalid email or password.",
        backend: isNeonConfigured() ? "neon" : "mock",
        hint: isNeonConfigured()
          ? "Neon is on but this account was not found. Open /api/health — if profiles is 0, schema/seed is incomplete."
          : "DATABASE_URL is missing on Vercel — you are on MOCK auth only.",
      },
      { status: 401 }
    );
  }

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({
    user: publicUser(user),
    backend: isNeonConfigured() ? "neon" : "mock",
  });
}
