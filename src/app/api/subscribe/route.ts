import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { creator_id } = await req.json();
    if (!creator_id) return NextResponse.json({ error: "Creator ID required" }, { status: 400 });

    if (payload.id === creator_id) {
      return NextResponse.json({ error: "Cannot subscribe to yourself" }, { status: 400 });
    }

    const db = getDb();
    const creator = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'creator'").get(creator_id);
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const existing = db.prepare(
      "SELECT id, status FROM subscriptions WHERE fan_id = ? AND creator_id = ?"
    ).get(payload.id, creator_id) as { id: number; status: string } | undefined;

    if (existing) {
      if (existing.status === "active") {
        // Unsubscribe
        db.prepare("UPDATE subscriptions SET status = 'cancelled' WHERE id = ?").run(existing.id);
        return NextResponse.json({ message: "Unsubscribed", subscribed: false });
      } else {
        // Resubscribe
        db.prepare("UPDATE subscriptions SET status = 'active', created_at = CURRENT_TIMESTAMP WHERE id = ?").run(existing.id);
        return NextResponse.json({ message: "Subscribed", subscribed: true });
      }
    }

    db.prepare(
      "INSERT INTO subscriptions (fan_id, creator_id, status) VALUES (?, ?, 'active')"
    ).run(payload.id, creator_id);

    return NextResponse.json({ message: "Subscribed", subscribed: true });
  } catch (error: unknown) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
