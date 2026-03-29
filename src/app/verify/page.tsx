"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("none");
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch("/api/verify/status");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setStatus(data.status);
      if (data.verificationUrl) setVerificationUrl(data.verificationUrl);
      if (data.status === "approved") {
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      router.push("/login");
    }
    setLoading(false);
  }

  async function startVerification() {
    setStarting(true);
    try {
      const res = await fetch("/api/verify/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackUrl: window.location.origin + "/verify" }),
      });
      const data = await res.json();
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl);
        setStatus("pending");
        // Open Veriff in new tab
        window.open(data.verificationUrl, "_blank");
      }
    } catch {
      // ignore
    }
    setStarting(false);
  }

  async function recheckStatus() {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 font-light text-lg">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/" className="font-heading text-4xl text-white font-light">OurSociete</Link>
          <p className="text-white/60 mt-2 font-light">Identity Verification</p>
        </div>

        <div className="glass-card p-8 animate-fade-up">
          {status === "approved" && (
            <div className="text-center">
              <div className="text-green-400 text-5xl mb-4">&#10003;</div>
              <h2 className="font-heading text-2xl text-white mb-2">Verified!</h2>
              <p className="text-white/60 font-light mb-6">
                Your identity has been verified. Redirecting to your dashboard...
              </p>
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          )}

          {status === "none" && (
            <div className="text-center">
              <div className="text-accent text-5xl mb-4">&#128274;</div>
              <h2 className="font-heading text-2xl text-white mb-2">Verify Your Identity</h2>
              <p className="text-white/60 font-light mb-4">
                To start posting as a creator, we need to verify your identity. This keeps our platform safe and helps us comply with regulations.
              </p>
              <div className="text-left mb-6">
                <p className="text-white/50 text-sm font-light mb-3">What you will need:</p>
                <ul className="space-y-2 text-white/60 text-sm font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">&#10003;</span>
                    A government-issued photo ID (passport, driver&apos;s license, or national ID)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">&#10003;</span>
                    A device with a camera for a selfie
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">&#10003;</span>
                    Takes about 2-3 minutes
                  </li>
                </ul>
              </div>
              <button
                onClick={startVerification}
                disabled={starting}
                className={`w-full py-3.5 rounded-xl font-semibold bg-accent text-darkpurple hover:bg-accent/90 transition-all ${starting ? "opacity-50" : ""}`}
              >
                {starting ? "Starting verification..." : "Start Verification"}
              </button>
              <p className="text-white/30 text-xs mt-4">Powered by Veriff. Your data is processed securely.</p>
            </div>
          )}

          {status === "pending" && (
            <div className="text-center">
              <div className="text-yellow-400 text-5xl mb-4">&#9203;</div>
              <h2 className="font-heading text-2xl text-white mb-2">Verification in Progress</h2>
              <p className="text-white/60 font-light mb-6">
                Your verification is being processed. This usually takes a few minutes.
              </p>
              {verificationUrl && (
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mb-4 inline-flex"
                >
                  Continue Verification
                </a>
              )}
              <div className="mt-4">
                <button
                  onClick={recheckStatus}
                  disabled={checking}
                  className={`text-accent text-sm hover:underline ${checking ? "opacity-50" : ""}`}
                >
                  {checking ? "Checking..." : "Check verification status"}
                </button>
              </div>
            </div>
          )}

          {status === "declined" && (
            <div className="text-center">
              <div className="text-red-400 text-5xl mb-4">&#10007;</div>
              <h2 className="font-heading text-2xl text-white mb-2">Verification Failed</h2>
              <p className="text-white/60 font-light mb-6">
                Your verification was not approved. This can happen if the photo was unclear or the ID was not readable. You can try again.
              </p>
              <button
                onClick={startVerification}
                disabled={starting}
                className={`w-full py-3.5 rounded-xl font-semibold bg-accent text-darkpurple hover:bg-accent/90 transition-all ${starting ? "opacity-50" : ""}`}
              >
                {starting ? "Starting..." : "Try Again"}
              </button>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center">
              <div className="text-white/40 text-5xl mb-4">&#9200;</div>
              <h2 className="font-heading text-2xl text-white mb-2">Verification Expired</h2>
              <p className="text-white/60 font-light mb-6">
                Your verification session expired. Please start a new one.
              </p>
              <button
                onClick={startVerification}
                disabled={starting}
                className={`w-full py-3.5 rounded-xl font-semibold bg-accent text-darkpurple hover:bg-accent/90 transition-all ${starting ? "opacity-50" : ""}`}
              >
                {starting ? "Starting..." : "Start New Verification"}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-white/40 text-sm hover:text-white/60 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
