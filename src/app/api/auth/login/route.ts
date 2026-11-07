import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { authenticateUser, publicUser } from "@/lib/db/users";
import { isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isNeonConfigured() && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Authentication database is not configured." }, { status: 503 });
  }
  try {
    let body: { email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }
    if (email.length > 254 || password.length > 128) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    let user;
    try {
      user = await authenticateUser(email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password_hash") || msg.includes("does not exist")) {
        return NextResponse.json(
          {
            error:
              "Database profiles table is missing password_hash. Run the profiles fix SQL in Neon SQL Editor, then try again.",
            backend: "neon",
            code: "SCHEMA_FIX_REQUIRED",
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Login service unavailable.", backend: isNeonConfigured() ? "neon" : "unconfigured" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
          backend: isNeonConfigured() ? "neon" : "mock",
          hint: isNeonConfigured()
            ? "Create an account using the configured registration flow, then ask an administrator to grant admin access if needed."
            : "DATABASE_URL missing — mock mode.",
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
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Login failed",
        backend: isNeonConfigured() ? "neon" : "mock",
      },
      { status: 500 }
    );
  }
}
