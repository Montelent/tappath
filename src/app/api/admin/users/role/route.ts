import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let body: { id?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = String(body.id || "");
  const role = body.role === "admin" ? "admin" : body.role === "user" ? "user" : null;
  if (!id || !role) {
    return NextResponse.json({ error: "id and role (user|admin) required" }, { status: 400 });
  }

  if (admin.id === id && role === "user") {
    return NextResponse.json(
      { error: "You cannot demote your own account while signed in." },
      { status: 400 }
    );
  }

  const sql = getSql()!;
  try {
    const rows = await sql`
      UPDATE profiles SET role = ${role}
      WHERE id::text = ${id}
      RETURNING id, email, name, role, created_at::text
    `;
    if (!rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user: rows[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}
