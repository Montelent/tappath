import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { setSessionCookie } from "@/lib/session";
import { findUserByEmail, publicUser, saveStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
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
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const id = `user-${Date.now()}`;
  const user = {
    id,
    email,
    name: name || "User",
    passwordHash: hashPassword(password),
    role: "user" as const,
    createdAt: new Date().toISOString(),
  };

  saveStore((db) => {
    db.users.push(user);
  });

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ user: publicUser(user) });
}
