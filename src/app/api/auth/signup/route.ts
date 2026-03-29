import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === "creator" ? "creator" : "fan";
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

    const result = db.prepare(
      "INSERT INTO users (email, password, name, username, role) VALUES (?, ?, ?, ?, ?)"
    ).run(email, hashedPassword, name, username, userRole);

    const token = signToken({
      id: Number(result.lastInsertRowid),
      email,
      name,
      username,
      role: userRole,
    });

    const response = NextResponse.json({
      message: "Account created successfully",
      user: { id: Number(result.lastInsertRowid), email, name, username, role: userRole },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
