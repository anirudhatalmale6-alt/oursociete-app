import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = params.path.join("/");

  // Prevent directory traversal
  if (filePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", "uploads", filePath);

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const ext = path.extname(fullPath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  const fileBuffer = fs.readFileSync(fullPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
