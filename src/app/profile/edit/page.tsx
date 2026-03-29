"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  cover_photo: string | null;
  bio: string;
  location: string;
  categories: string;
  subscription_price: number;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("0");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not auth");
        return res.json();
      })
      .then((data) => {
        const u = data.user;
        setUser(u);
        setName(u.name || "");
        setBio(u.bio || "");
        setLocation(u.location || "");
        setCategories(u.categories || "");
        setSubscriptionPrice(String(u.subscription_price || 0));
        if (u.avatar) setAvatarPreview(u.avatar);
        if (u.cover_photo) setCoverPreview(u.cover_photo);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("location", location);
    formData.append("categories", categories);
    formData.append("subscription_price", subscriptionPrice);
    if (avatarFile) formData.append("avatar", avatarFile);
    if (coverFile) formData.append("cover_photo", coverFile);

    try {
      const res = await fetch("/api/profile", { method: "PUT", body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile updated!");
        setUser(data.user);
      } else {
        setMessage(data.error || "Failed to update");
      }
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 font-light text-lg">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl text-white font-light">OurSociete</Link>
          <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl text-white font-light mb-8 animate-fade-up">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
          {/* Cover Photo */}
          <div>
            <label className="block text-white/60 text-sm mb-2 font-light">Cover Photo</label>
            <div
              className="relative w-full h-48 rounded-2xl bg-white/10 border border-white/20 overflow-hidden cursor-pointer group"
              onClick={() => document.getElementById("cover-input")?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30">Click to upload cover photo</div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm">
                Change cover
              </div>
            </div>
            <input id="cover-input" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-white/60 text-sm mb-2 font-light">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-full bg-white/10 border border-white/20 overflow-hidden cursor-pointer group relative flex-shrink-0"
                onClick={() => document.getElementById("avatar-input")?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30 text-3xl">+</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                  Change
                </div>
              </div>
              <div className="text-white/40 text-sm font-light">Click to upload</div>
            </div>
            <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 font-light">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 font-light">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell fans about yourself..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 font-light">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Los Angeles, CA"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 font-light">Categories</label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="e.g. Photography, Art, Fitness"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Subscription Price */}
          {user?.role === "creator" && (
            <div>
              <label className="block text-white/60 text-sm mb-1.5 font-light">Monthly Subscription Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-white/30 text-xs mt-1">Set to 0 for free access</p>
            </div>
          )}

          {message && (
            <p className={`text-sm text-center ${message.includes("updated") ? "text-green-300" : "text-red-300"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-semibold bg-accent text-darkpurple hover:bg-accent/90 transition-all ${saving ? "opacity-50" : ""}`}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
