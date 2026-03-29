import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const db = getDb();
    const creator = db.prepare(`
      SELECT u.id, u.name, u.username, u.avatar, u.cover_photo, u.bio, u.location, u.categories, u.subscription_price,
        (SELECT COUNT(*) FROM subscriptions WHERE creator_id = u.id AND status = 'active') as subscriber_count,
        (SELECT COUNT(*) FROM posts WHERE creator_id = u.id) as post_count
      FROM users u
      WHERE u.username = ? AND u.role = 'creator'
    `).get(params.username);

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check if current user is subscribed
    let isSubscribed = false;
    const token = req.cookies.get("token")?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const sub = db.prepare(
          "SELECT id FROM subscriptions WHERE fan_id = ? AND creator_id = ? AND status = 'active'"
        ).get(payload.id, (creator as { id: number }).id);
        isSubscribed = !!sub;
      }
    }

    // Get posts (free ones for non-subscribers, all for subscribers)
    const creatorObj = creator as { id: number };
    let posts;
    if (isSubscribed) {
      posts = db.prepare("SELECT * FROM posts WHERE creator_id = ? ORDER BY created_at DESC").all(creatorObj.id);
    } else {
      posts = db.prepare("SELECT * FROM posts WHERE creator_id = ? AND is_premium = 0 ORDER BY created_at DESC").all(creatorObj.id);
    }

    return NextResponse.json({ creator, posts, isSubscribed });
  } catch (error: unknown) {
    console.error("Creator profile error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
