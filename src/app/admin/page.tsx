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
  is_approved: number;
  created_at: string;
  post_count: number;
  subscriber_count: number;
}

interface Stats {
  total: number;
  creators: number;
  fans: number;
  posts: number;
  subscriptions: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  function loadData() {
    fetch("/api/admin/users")
      .then((res) => {
        if (res.status === 403) throw new Error("Not admin");
        if (!res.ok) throw new Error("Not auth");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }

  useEffect(() => { loadData(); }, [router]);

  async function handleAction(userId: number, action: string, value?: string) {
    if (action === "delete" && !confirm("Are you sure you want to delete this user?")) return;

    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });
    loadData();
  }

  const filteredUsers = filter === "all" ? users : users.filter((u) => u.role === filter);

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
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold">Admin</span>
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      <div className="max-w-[70rem] mx-auto px-6 md:px-12 py-12">
        <h1 className="font-heading text-3xl text-white font-light mb-8 animate-fade-up">Admin Panel</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-fade-up">
            {[
              { label: "Total Users", value: stats.total, color: "text-white" },
              { label: "Creators", value: stats.creators, color: "text-accent" },
              { label: "Fans", value: stats.fans, color: "text-cyan" },
              { label: "Posts", value: stats.posts, color: "text-white" },
              { label: "Subscriptions", value: stats.subscriptions, color: "text-accent" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className={`font-heading text-2xl ${stat.color}`}>{stat.value}</div>
                <div className="text-white/40 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6 animate-fade-up">
          {["all", "creator", "fan", "admin"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                filter === f ? "bg-accent text-darkpurple font-semibold" : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden animate-fade-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/40 text-xs font-light">User</th>
                  <th className="text-left p-4 text-white/40 text-xs font-light">Role</th>
                  <th className="text-left p-4 text-white/40 text-xs font-light hidden md:table-cell">Posts</th>
                  <th className="text-left p-4 text-white/40 text-xs font-light hidden md:table-cell">Subs</th>
                  <th className="text-left p-4 text-white/40 text-xs font-light hidden md:table-cell">Joined</th>
                  <th className="text-right p-4 text-white/40 text-xs font-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                              {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm">{user.name || "No name"}</p>
                          <p className="text-white/30 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleAction(user.id, "changeRole", e.target.value)}
                        className="bg-white/10 text-white text-xs rounded px-2 py-1 border border-white/20"
                      >
                        <option value="fan" className="bg-gray-800">Fan</option>
                        <option value="creator" className="bg-gray-800">Creator</option>
                        <option value="admin" className="bg-gray-800">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-white/60 text-sm hidden md:table-cell">{user.post_count}</td>
                    <td className="p-4 text-white/60 text-sm hidden md:table-cell">{user.subscriber_count}</td>
                    <td className="p-4 text-white/40 text-xs hidden md:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!user.is_approved && user.role === "creator" && (
                          <button
                            onClick={() => handleAction(user.id, "approve")}
                            className="px-3 py-1 rounded bg-green-500/20 text-green-300 text-xs hover:bg-green-500/30"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user.id, "delete")}
                          className="px-3 py-1 rounded bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
