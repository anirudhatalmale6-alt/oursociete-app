import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import getDb from "@/lib/db";
import crypto from "crypto";

const VERIFF_API_KEY = process.env.VERIFF_API_KEY || "0a7ef399-f64e-46a2-9c3e-fd1c1e06ead1";
const VERIFF_SECRET = process.env.VERIFF_SECRET || "ae8ed162-646a-4789-9623-4730cb69ee1d";
const VERIFF_BASE_URL = "https://stationapi.veriff.com";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = getDb();

    // Check user's verified status first
    const user = db.prepare("SELECT is_verified FROM users WHERE id = ?").get(payload.id) as { is_verified: number } | undefined;
    if (user?.is_verified) {
      return NextResponse.json({ status: "approved", is_verified: true });
    }

    // Get latest verification
    const verification = db.prepare(
      "SELECT * FROM verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
    ).get(payload.id) as { session_id: string; status: string; veriff_url: string } | undefined;

    if (!verification) {
      return NextResponse.json({ status: "none", is_verified: false });
    }

    // If pending, poll Veriff API for latest status
    if (verification.status === "pending") {
      try {
        const signature = crypto
          .createHmac("sha256", VERIFF_SECRET)
          .update(Buffer.from(verification.session_id, "utf8"))
          .digest("hex");

        const response = await fetch(
          `${VERIFF_BASE_URL}/v1/sessions/${verification.session_id}/decision`,
          {
            headers: {
              "X-AUTH-CLIENT": VERIFF_API_KEY,
              "X-HMAC-SIGNATURE": signature,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const veriffStatus = data.verification?.status;

          if (veriffStatus === "approved") {
            db.prepare("UPDATE verifications SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE session_id = ?")
              .run(verification.session_id);
            db.prepare("UPDATE users SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
              .run(payload.id);
            return NextResponse.json({ status: "approved", is_verified: true });
          } else if (veriffStatus === "declined" || veriffStatus === "resubmission_requested") {
            db.prepare("UPDATE verifications SET status = 'declined', updated_at = CURRENT_TIMESTAMP WHERE session_id = ?")
              .run(verification.session_id);
            return NextResponse.json({ status: "declined", is_verified: false });
          }
        }
      } catch {
        // Polling failed, return local status
      }
    }

    return NextResponse.json({
      status: verification.status,
      is_verified: verification.status === "approved",
      verificationUrl: verification.status === "pending" ? verification.veriff_url : undefined,
    });
  } catch (error: unknown) {
    console.error("Verify status error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
