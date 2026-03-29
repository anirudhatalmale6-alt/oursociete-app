import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";

const VERIFF_API_KEY = process.env.VERIFF_API_KEY || "0a7ef399-f64e-46a2-9c3e-fd1c1e06ead1";
const VERIFF_BASE_URL = "https://stationapi.veriff.com";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = getDb();

    // Check if user already has a pending or approved verification
    const existing = db.prepare(
      "SELECT * FROM verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
    ).get(payload.id) as { status: string; veriff_url: string; session_id: string } | undefined;

    if (existing && existing.status === "approved") {
      return NextResponse.json({ message: "Already verified", status: "approved" });
    }

    if (existing && existing.status === "pending" && existing.veriff_url) {
      return NextResponse.json({
        message: "Verification in progress",
        status: "pending",
        verificationUrl: existing.veriff_url,
        sessionId: existing.session_id,
      });
    }

    // Get user details
    const user = db.prepare("SELECT name, email FROM users WHERE id = ?").get(payload.id) as { name: string; email: string };

    // Get callback URL from request
    const { callbackUrl } = await req.json().catch(() => ({ callbackUrl: "" }));

    // Create Veriff session
    const response = await fetch(`${VERIFF_BASE_URL}/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-CLIENT": VERIFF_API_KEY,
      },
      body: JSON.stringify({
        verification: {
          callback: callbackUrl || "https://oursociete.com/verify/callback",
          person: {
            firstName: user.name.split(" ")[0] || user.name,
            lastName: user.name.split(" ").slice(1).join(" ") || ".",
          },
          vendorData: String(payload.id),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Veriff API error:", response.status, errorText);
      return NextResponse.json({ error: "Failed to create verification session" }, { status: 500 });
    }

    const data = await response.json();
    const sessionId = data.verification?.id;
    const veriffUrl = data.verification?.url;

    if (!sessionId || !veriffUrl) {
      console.error("Veriff response missing data:", data);
      return NextResponse.json({ error: "Invalid response from verification service" }, { status: 500 });
    }

    // Save verification record
    db.prepare(
      "INSERT INTO verifications (user_id, session_id, status, veriff_url) VALUES (?, ?, 'pending', ?)"
    ).run(payload.id, sessionId, veriffUrl);

    return NextResponse.json({
      message: "Verification session created",
      status: "pending",
      verificationUrl: veriffUrl,
      sessionId,
    });
  } catch (error: unknown) {
    console.error("Verify create error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
