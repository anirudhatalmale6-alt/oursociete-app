"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Creator {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  cover_photo: string | null;
  bio: string;
  location: string;
  categories: string;
  subscription_price: number;
  subscriber_count: number;
  post_count: number;
}

interface Post {
  id: number;
  title: string;
  caption: string;
  media_type: string;
  media_url: string;
  is_premium: number;
  created_at: string;
}

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetch(`/api/creators/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setCreator(data.creator);
        setPosts(data.posts || []);
        setIsSubscribed(data.isSubscribed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username]);

  async function handleSubscribe() {
    if (!creator) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_id: creator.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSubscribed(data.subscribed);
        // Refresh posts
        const refreshRes = await fetch(`/api/creators/${username}`);
        const refreshData = await refreshRes.json();
        setPosts(refreshData.posts || []);
      }
    } catch { /* ignore */ }
    setSubscribing(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 font-light text-lg">Loading...</div>
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-white mb-4">Creator not found</h1>
          <Link href="/discover" className="btn-primary">Browse Creators</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl text-white font-light">OurSociete</Link>
          <div className="flex items-center gap-4">
            <Link href="/discover" className="text-white/60 hover:text-white text-sm transition-colors">Discover</Link>
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary/40 to-bluepurple/40 relative">
        {creator.cover_photo && (
          <img src={creator.cover_photo} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-[70rem] mx-auto px-6 md:px-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 border-4 border-primary overflow-hidden flex-shrink-0">
            {creator.avatar ? (
              <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl bg-white/10">
                {creator.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl text-white font-light">
              {creator.name || "Anonymous Creator"}
            </h1>
            <p className="text-white/40">@{creator.username}</p>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isSubscribed
                ? "bg-white/10 text-white/70 hover:bg-white/20"
                : "bg-accent text-darkpurple hover:bg-accent/90"
            }`}
          >
            {subscribing ? "..." : isSubscribed ? "Subscribed" : creator.subscription_price > 0 ? `Subscribe $${creator.subscription_price}/mo` : "Subscribe Free"}
          </button>
        </div>

        {/* Bio & Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            {creator.bio && <p className="text-white/70 font-light mb-4">{creator.bio}</p>}
            {creator.location && (
              <p className="text-white/40 text-sm">&#128205; {creator.location}</p>
            )}
            {creator.categories && (
              <div className="flex flex-wrap gap-2 mt-3">
                {creator.categories.split(",").map((cat, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs">
                    {cat.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex md:flex-col gap-4">
            <div className="glass-card p-4 text-center flex-1">
              <div className="font-heading text-2xl text-white">{creator.post_count}</div>
              <div className="text-white/40 text-sm">Posts</div>
            </div>
            <div className="glass-card p-4 text-center flex-1">
              <div className="font-heading text-2xl text-white">{creator.subscriber_count}</div>
              <div className="text-white/40 text-sm">Subscribers</div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <h2 className="font-heading text-2xl text-white mb-6">Posts</h2>
        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/40 font-light">
              {isSubscribed ? "No posts yet. Check back soon!" : "Subscribe to see this creator's content"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
            {posts.map((post) => (
              <div key={post.id} className="glass-card overflow-hidden group">
                <div className="aspect-square relative">
                  {post.media_type === "image" ? (
                    <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <video src={post.media_url} className="w-full h-full object-cover" />
                  )}
                  {post.is_premium === 1 && (
                    <div className="absolute top-2 right-2 bg-accent/80 text-darkpurple text-xs px-2 py-1 rounded-full font-semibold">
                      Premium
                    </div>
                  )}
                </div>
                {(post.title || post.caption) && (
                  <div className="p-3">
                    {post.title && <h3 className="text-white text-sm font-semibold">{post.title}</h3>}
                    {post.caption && <p className="text-white/50 text-xs font-light mt-1 line-clamp-2">{post.caption}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
