"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not auth");
        return res.json();
      })
      .then((data) => {
        if (data.user.role !== "creator") {
          router.push("/dashboard");
          return;
        }
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (f.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(f));
      } else {
        setPreview(null);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("caption", caption);
    formData.append("is_premium", String(isPremium));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessage("Content uploaded successfully!");
        setTitle("");
        setCaption("");
        setFile(null);
        setPreview(null);
        setIsPremium(false);
        // Reset file input
        const input = document.getElementById("file-input") as HTMLInputElement;
        if (input) input.value = "";
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch {
      setMessage("Network error");
    }
    setUploading(false);
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
        <h1 className="font-heading text-3xl text-white font-light mb-2 animate-fade-up">Upload Content</h1>
        <p className="text-white/50 font-light mb-8 animate-fade-up">Share photos and videos with your subscribers</p>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
          {/* File Upload */}
          <div>
            <label className="block text-white/60 text-sm mb-2 font-light">Photo or Video</label>
            <div
              className="relative w-full min-h-[200px] rounded-2xl bg-white/10 border-2 border-dashed border-white/20 overflow-hidden cursor-pointer group flex items-center justify-center"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-[400px] object-contain" />
              ) : file ? (
                <div className="text-center p-8">
                  <div className="text-accent text-4xl mb-2">&#9654;</div>
                  <p className="text-white/70">{file.name}</p>
                  <p className="text-white/40 text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-white/30 text-4xl mb-2">+</div>
                  <p className="text-white/40 font-light">Click to select a photo or video</p>
                  <p className="text-white/20 text-sm mt-1">JPG, PNG, GIF, MP4, MOV (max 50MB)</p>
                </div>
              )}
            </div>
            <input id="file-input" type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 font-light">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-white/60 text-sm mb-1.5 font-light">Caption (optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Add a caption..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPremium(!isPremium)}
              className={`w-12 h-6 rounded-full transition-all relative ${isPremium ? "bg-accent" : "bg-white/20"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${isPremium ? "left-6" : "left-0.5"}`} />
            </button>
            <span className="text-white/70 text-sm font-light">
              {isPremium ? "Subscribers only" : "Free for everyone"}
            </span>
          </div>

          {message && (
            <p className={`text-sm text-center ${message.includes("success") ? "text-green-300" : "text-red-300"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-3.5 rounded-xl font-semibold bg-accent text-darkpurple hover:bg-accent/90 transition-all ${uploading || !file ? "opacity-50" : ""}`}
          >
            {uploading ? "Uploading..." : "Upload Content"}
          </button>
        </form>
      </div>
    </main>
  );
}
