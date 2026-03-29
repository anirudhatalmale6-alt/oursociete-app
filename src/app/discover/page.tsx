"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Creator {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  cover_photo: string | null;
  bio: string;
  categories: string;
  subscription_price: number;
  subscriber_count: number;
  post_count: number;
}

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creators")
      .then((res) => res.json())
      .then((data) => {
        setCreators(data.creators || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl text-white font-light">OurSociete</Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
            <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors">Log in</Link>
          </div>
        </div>
      </header>

      <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-heading text-4xl md:text-5xl text-white font-light mb-4">Discover Creators</h1>
          <p className="text-white/60 font-light text-lg">Browse anonymous creators and subscribe to see their exclusive content</p>
        </div>

        {loading ? (
          <div className="text-center text-white/60 font-light">Loading creators...</div>
        ) : creators.length === 0 ? (
          <div className="text-center glass-card p-12 animate-fade-up">
            <div className="text-white/30 text-5xl mb-4">&#128100;</div>
            <h2 className="font-heading text-2xl text-white mb-2">No creators yet</h2>
            <p className="text-white/50 font-light mb-6">Be the first to join and start sharing content</p>
            <Link href="/signup" className="btn-primary">Apply as Creator!</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.username}`}
                className="glass-card overflow-hidden hover:bg-white/10 transition-all group block animate-fade-up"
              >
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-primary/30 to-bluepurple/30 relative overflow-hidden">
                  {creator.cover_photo && (
                    <img src={creator.cover_photo} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Avatar */}
                <div className="px-6 -mt-8 relative">
                  <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-primary/30 overflow-hidden">
                    {creator.avatar ? (
                      <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-xl">
                        {creator.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="px-6 pb-6 pt-3">
                  <h3 className="font-heading text-xl text-white group-hover:text-accent transition-colors">
                    {creator.name || "Anonymous Creator"}
                  </h3>
                  <p className="text-white/40 text-sm">@{creator.username}</p>
                  {creator.bio && (
                    <p className="text-white/60 text-sm font-light mt-2 line-clamp-2">{creator.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-white/40 text-xs">
                    <span>{creator.post_count} posts</span>
                    <span>{creator.subscriber_count} subscribers</span>
                    {creator.subscription_price > 0 && (
                      <span className="text-accent">${creator.subscription_price}/mo</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
