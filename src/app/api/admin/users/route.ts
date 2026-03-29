import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = getDb();
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(payload.id) as { role: string } | undefined;
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const users = db.prepare(`
      SELECT u.id, u.email, u.name, u.username, u.role, u.avatar, u.bio, u.is_verified, u.is_approved, u.created_at,
        (SELECT COUNT(*) FROM posts WHERE creator_id = u.id) as post_count,
        (SELECT COUNT(*) FROM subscriptions WHERE creator_id = u.id AND status = 'active') as subscriber_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    const stats = {
      total: users.length,
      creators: (users as { role: string }[]).filter(u => u.role === "creator").length,
      fans: (users as { role: string }[]).filter(u => u.role === "fan").length,
      posts: (db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number }).count,
      subscriptions: (db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get() as { count: number }).count,
    };

    return NextResponse.json({ users, stats });
  } catch (error: unknown) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = getDb();
    const admin = db.prepare("SELECT role FROM users WHERE id = ?").get(payload.id) as { role: string } | undefined;
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, action, value } = await req.json();

    if (action === "approve") {
      db.prepare("UPDATE users SET is_approved = 1 WHERE id = ?").run(userId);
    } else if (action === "verify") {
      db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(userId);
    } else if (action === "changeRole") {
      const allowed = ["fan", "creator", "admin"];
      if (allowed.includes(value)) {
        db.prepare("UPDATE users SET role = ? WHERE id = ?").run(value, userId);
      }
    } else if (action === "delete") {
      db.prepare("DELETE FROM posts WHERE creator_id = ?").run(userId);
      db.prepare("DELETE FROM subscriptions WHERE fan_id = ? OR creator_id = ?").run(userId, userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error: unknown) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
