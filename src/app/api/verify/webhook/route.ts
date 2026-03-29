import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import getDb from "@/lib/db";

const VERIFF_SECRET = process.env.VERIFF_SECRET || "ae8ed162-646a-4789-9623-4730cb69ee1d";

function verifySignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha256", VERIFF_SECRET)
    .update(Buffer.from(payload, "utf8"))
    .digest("hex");
  return hash.toLowerCase() === signature.toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-hmac-signature") || req.headers.get("x-auth-signature") || "";

    // Verify HMAC signature
    if (signature && !verifySignature(body, signature)) {
      console.error("Invalid Veriff webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const sessionId = data.verification?.id || data.id;
    const status = data.verification?.status || data.status;
    const decision = data.verification?.code !== undefined
      ? String(data.verification.code)
      : (data.technicalData?.reason || "");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const db = getDb();

    // Find the verification record
    const verification = db.prepare(
      "SELECT * FROM verifications WHERE session_id = ?"
    ).get(sessionId) as { user_id: number; status: string } | undefined;

    if (!verification) {
      console.error("Verification not found for session:", sessionId);
      return NextResponse.json({ error: "Verification not found" }, { status: 404 });
    }

    // Map Veriff status to our status
    let mappedStatus = "pending";
    if (status === "approved" || data.verification?.code === 9001) {
      mappedStatus = "approved";
    } else if (status === "declined" || status === "resubmission_requested") {
      mappedStatus = "declined";
    } else if (status === "expired" || status === "abandoned") {
      mappedStatus = "expired";
    }

    // Update verification record
    db.prepare(
      "UPDATE verifications SET status = ?, decision = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?"
    ).run(mappedStatus, decision, sessionId);

    // If approved, update user's is_verified flag
    if (mappedStatus === "approved") {
      db.prepare("UPDATE users SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(verification.user_id);
    }

    return NextResponse.json({ message: "Webhook processed", status: mappedStatus });
  } catch (error: unknown) {
    console.error("Veriff webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
