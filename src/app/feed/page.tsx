"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: number;
  title: string;
  caption: string;
  media_type: string;
  media_url: string;
  is_premium: number;
  created_at: string;
  creator_name: string;
  creator_username: string;
  creator_avatar: string | null;
}

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not auth");
        return res.json();
      })
      .then(() => fetch("/api/posts"))
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

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
          <div className="flex items-center gap-4">
            <Link href="/discover" className="text-white/60 hover:text-white text-sm transition-colors">Discover</Link>
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl text-white font-light mb-8 animate-fade-up">Your Feed</h1>

        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-up">
            <div className="text-white/30 text-5xl mb-4">&#128240;</div>
            <h2 className="font-heading text-2xl text-white mb-2">Your feed is empty</h2>
            <p className="text-white/50 font-light mb-6">Subscribe to creators to see their posts here</p>
            <Link href="/discover" className="btn-primary">Discover Creators</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="glass-card overflow-hidden animate-fade-up">
                {/* Creator header */}
                <div className="flex items-center gap-3 p-4">
                  <Link href={`/creator/${post.creator_username}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                      {post.creator_avatar ? (
                        <img src={post.creator_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          {post.creator_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold group-hover:text-accent transition-colors">
                        {post.creator_name}
                      </p>
                      <p className="text-white/40 text-xs">@{post.creator_username}</p>
                    </div>
                  </Link>
                  <span className="text-white/30 text-xs ml-auto">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Media */}
                {post.media_type === "image" ? (
                  <img src={post.media_url} alt={post.title} className="w-full" />
                ) : (
                  <video src={post.media_url} controls className="w-full" />
                )}

                {/* Caption */}
                {(post.title || post.caption) && (
                  <div className="p-4">
                    {post.title && <h3 className="text-white font-semibold mb-1">{post.title}</h3>}
                    {post.caption && <p className="text-white/60 font-light text-sm">{post.caption}</p>}
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
