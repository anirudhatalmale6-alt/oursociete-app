"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  role: string;
  avatar: string | null;
  bio: string;
  is_verified: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 font-light text-lg">Loading...</div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl text-white font-light">
            OurSociete
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm font-light hidden sm:block">
              {user.email}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === "creator" ? "bg-accent/20 text-accent" : "bg-cyan/20 text-cyan"
            }`}>
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-12">
        <div className="animate-fade-up">
          <h1 className="font-heading text-3xl md:text-4xl text-white font-light mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="text-white/60 font-light mb-8">
            {user.role === "creator"
              ? "Your creator dashboard. Upload content and manage your page."
              : "Your fan dashboard. Discover creators and manage subscriptions."}
          </p>
        </div>

        {/* Verification Banner for Creators */}
        {user.role === "creator" && !user.is_verified && (
          <div className="glass-card p-6 mb-8 border border-yellow-400/30 animate-fade-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-yellow-400 text-2xl flex-shrink-0">&#128274;</div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-white mb-1">Verify Your Identity</h3>
                <p className="text-white/50 font-light text-sm">
                  Complete identity verification to start uploading content. This keeps our platform safe.
                </p>
              </div>
              <Link
                href="/verify"
                className="px-6 py-2.5 rounded-xl font-semibold bg-accent text-darkpurple hover:bg-accent/90 transition-all text-sm flex-shrink-0"
              >
                Verify Now
              </Link>
            </div>
          </div>
        )}

        {user.role === "creator" && !!user.is_verified && (
          <div className="glass-card p-4 mb-8 border border-green-400/30 animate-fade-up">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-lg">&#10003;</span>
              <span className="text-green-300 text-sm font-light">Identity verified</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {user.role === "creator" ? (
            <>
              <Link href="/profile/edit" className="glass-card p-6 hover:bg-white/10 transition-colors block">
                <div className="text-accent text-2xl mb-3">&#9998;</div>
                <h3 className="font-heading text-xl text-white mb-2">Edit Profile</h3>
                <p className="text-white/50 font-light text-sm">Update your bio, avatar, and page details</p>
              </Link>
              <Link href="/upload" className="glass-card p-6 hover:bg-white/10 transition-colors block">
                <div className="text-accent text-2xl mb-3">&#10514;</div>
                <h3 className="font-heading text-xl text-white mb-2">Upload Content</h3>
                <p className="text-white/50 font-light text-sm">Share photos and videos with your subscribers</p>
              </Link>
              <Link href="/verify" className="glass-card p-6 hover:bg-white/10 transition-colors block">
                <div className={`text-2xl mb-3 ${user.is_verified ? "text-green-400" : "text-accent"}`}>
                  {user.is_verified ? "\u2713" : "\u{1F512}"}
                </div>
                <h3 className="font-heading text-xl text-white mb-2">Verification</h3>
                <p className="text-white/50 font-light text-sm">
                  {user.is_verified ? "Identity verified" : "Verify your identity to post"}
                </p>
              </Link>
            </>
          ) : (
            <>
              <Link href="/discover" className="glass-card p-6 hover:bg-white/10 transition-colors block">
                <div className="text-cyan text-2xl mb-3">&#128269;</div>
                <h3 className="font-heading text-xl text-white mb-2">Discover Creators</h3>
                <p className="text-white/50 font-light text-sm">Browse and subscribe to creators</p>
              </Link>
              <Link href="/subscriptions" className="glass-card p-6 hover:bg-white/10 transition-colors block">
                <div className="text-cyan text-2xl mb-3">&#9829;</div>
                <h3 className="font-heading text-xl text-white mb-2">My Subscriptions</h3>
                <p className="text-white/50 font-light text-sm">Manage your active subscriptions</p>
              </Link>
              <Link href="/feed" className="glass-card p-6 hover:bg-white/10 transition-colors block">
                <div className="text-cyan text-2xl mb-3">&#9881;</div>
                <h3 className="font-heading text-xl text-white mb-2">My Feed</h3>
                <p className="text-white/50 font-light text-sm">See latest posts from your subscriptions</p>
              </Link>
            </>
          )}
        </div>

        {/* Account Info */}
        <div className="glass-card p-8">
          <h2 className="font-heading text-2xl text-white mb-4">Account Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/40 font-light">Username</span>
              <p className="text-white">@{user.username}</p>
            </div>
            <div>
              <span className="text-white/40 font-light">Email</span>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <span className="text-white/40 font-light">Role</span>
              <p className="text-white capitalize">{user.role}</p>
            </div>
            <div>
              <span className="text-white/40 font-light">Member since</span>
              <p className="text-white">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
