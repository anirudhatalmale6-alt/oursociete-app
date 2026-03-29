import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare(
      "SELECT id, email, name, username, role, avatar, cover_photo, bio, location, categories, subscription_price, is_verified, is_approved, created_at FROM users WHERE id = ?"
    ).get(payload.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
