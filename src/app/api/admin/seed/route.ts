import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  return NextResponse.json({
    error: "Static seeding is disabled to protect live editorial content.",
    message: "Create and manage published Brands, Devices, Guides, Topics, and Glossary entries in their Admin sections.",
  }, { status: 410 });
}
