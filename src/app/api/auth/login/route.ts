import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { authenticateUser, ensureDemoUsers, publicUser } from "@/lib/db/users";
import { isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    if (isNeonConfigured()) {
      try {
        await ensureDemoUsers();
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
      }
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
        { error: msg, backend: isNeonConfigured() ? "neon" : "mock" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
          backend: isNeonConfigured() ? "neon" : "mock",
          hint: isNeonConfigured()
            ? "After fixing schema, POST /api/setup once, then sign in."
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
