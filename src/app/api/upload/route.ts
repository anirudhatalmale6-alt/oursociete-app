import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    if (payload.role !== "creator") {
      return NextResponse.json({ error: "Only creators can upload content" }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const caption = formData.get("caption") as string;
    const isPremium = formData.get("is_premium") === "true" ? 1 : 0;
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Please select a file to upload" }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedImage = ["jpg", "jpeg", "png", "gif", "webp"];
    const allowedVideo = ["mp4", "mov", "webm"];
    const allowed = [...allowedImage, ...allowedVideo];

    if (!ext || !allowed.includes(ext)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const mediaType = allowedVideo.includes(ext) ? "video" : "image";
    const filename = `post_${payload.id}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const db = getDb();
    const result = db.prepare(
      "INSERT INTO posts (creator_id, title, caption, media_type, media_url, is_premium) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(payload.id, title || "", caption || "", mediaType, `/uploads/${filename}`, isPremium);

    return NextResponse.json({
      message: "Content uploaded successfully",
      post: {
        id: Number(result.lastInsertRowid),
        title,
        caption,
        media_type: mediaType,
        media_url: `/uploads/${filename}`,
        is_premium: isPremium,
      },
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
