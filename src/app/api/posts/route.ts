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
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creator_id");

    let posts;
    if (creatorId) {
      posts = db.prepare(`
        SELECT p.*, u.name as creator_name, u.username as creator_username, u.avatar as creator_avatar
        FROM posts p JOIN users u ON p.creator_id = u.id
        WHERE p.creator_id = ?
        ORDER BY p.created_at DESC
      `).all(parseInt(creatorId));
    } else if (payload.role === "creator") {
      posts = db.prepare(`
        SELECT p.*, u.name as creator_name, u.username as creator_username, u.avatar as creator_avatar
        FROM posts p JOIN users u ON p.creator_id = u.id
        WHERE p.creator_id = ?
        ORDER BY p.created_at DESC
      `).all(payload.id);
    } else {
      // Fan feed - show posts from subscribed creators + free posts
      posts = db.prepare(`
        SELECT p.*, u.name as creator_name, u.username as creator_username, u.avatar as creator_avatar
        FROM posts p
        JOIN users u ON p.creator_id = u.id
        LEFT JOIN subscriptions s ON s.creator_id = p.creator_id AND s.fan_id = ?
        WHERE s.id IS NOT NULL OR p.is_premium = 0
        ORDER BY p.created_at DESC
        LIMIT 50
      `).all(payload.id);
    }

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    console.error("Posts error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { postId } = await req.json();
    const db = getDb();

    const post = db.prepare("SELECT * FROM posts WHERE id = ? AND creator_id = ?").get(postId, payload.id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    db.prepare("DELETE FROM posts WHERE id = ? AND creator_id = ?").run(postId, payload.id);
    return NextResponse.json({ message: "Post deleted" });
  } catch (error: unknown) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
