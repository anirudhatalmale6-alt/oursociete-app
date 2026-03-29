import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const creators = db.prepare(`
      SELECT u.id, u.name, u.username, u.avatar, u.cover_photo, u.bio, u.categories, u.subscription_price,
        (SELECT COUNT(*) FROM subscriptions WHERE creator_id = u.id AND status = 'active') as subscriber_count,
        (SELECT COUNT(*) FROM posts WHERE creator_id = u.id) as post_count
      FROM users u
      WHERE u.role = 'creator'
      ORDER BY u.created_at DESC
    `).all();

    return NextResponse.json({ creators });
  } catch (error: unknown) {
    console.error("Creators list error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
