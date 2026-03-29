"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "creator";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/" className="font-heading text-4xl text-white font-light">
            OurSociete
          </Link>
          <p className="text-white/60 mt-2 font-light">Create your account</p>
        </div>

        {/* Sign Up Card */}
        <div className="glass-card p-8 animate-fade-up">
          {/* Role Selector */}
          <div className="flex rounded-full bg-white/10 p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("creator")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                role === "creator"
                  ? "bg-accent text-darkpurple"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Creator
            </button>
            <button
              type="button"
              onClick={() => setRole("fan")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                role === "fan"
                  ? "bg-cyan text-darkpurple"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Fan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1.5 font-light">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5 font-light">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5 font-light">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all ${
                role === "creator"
                  ? "bg-accent text-darkpurple hover:bg-accent/90"
                  : "bg-cyan text-darkpurple hover:bg-cyan/90"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Creating account..." : role === "creator" ? "Apply as Creator" : "Join as Fan"}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/30 text-xs mt-6">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 font-light text-lg">Loading...</div>
      </main>
    }>
      <SignupForm />
    </Suspense>
  );
}
