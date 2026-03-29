import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";
import fs from "fs";
import path from "path";

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const categories = formData.get("categories") as string;
    const subscriptionPrice = parseFloat(formData.get("subscription_price") as string) || 0;
    const avatarFile = formData.get("avatar") as File | null;
    const coverFile = formData.get("cover_photo") as File | null;

    const db = getDb();
    let avatarPath: string | null = null;
    let coverPath: string | null = null;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split(".").pop();
      const filename = `avatar_${payload.id}_${Date.now()}.${ext}`;
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      avatarPath = `/uploads/${filename}`;
    }

    if (coverFile && coverFile.size > 0) {
      const ext = coverFile.name.split(".").pop();
      const filename = `cover_${payload.id}_${Date.now()}.${ext}`;
      const buffer = Buffer.from(await coverFile.arrayBuffer());
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      coverPath = `/uploads/${filename}`;
    }

    let query = "UPDATE users SET name = ?, bio = ?, location = ?, categories = ?, subscription_price = ?, updated_at = CURRENT_TIMESTAMP";
    const params: (string | number)[] = [name || "", bio || "", location || "", categories || "", subscriptionPrice];

    if (avatarPath) {
      query += ", avatar = ?";
      params.push(avatarPath);
    }
    if (coverPath) {
      query += ", cover_photo = ?";
      params.push(coverPath);
    }

    query += " WHERE id = ?";
    params.push(payload.id);

    db.prepare(query).run(...params);

    const user = db.prepare(
      "SELECT id, email, name, username, role, avatar, cover_photo, bio, location, categories, subscription_price FROM users WHERE id = ?"
    ).get(payload.id);

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
