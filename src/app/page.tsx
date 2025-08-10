// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [user, setUser] = useState("mkusaka");
  const router = useRouter();

  return (
    <main className="min-h-dvh grid place-items-center p-6 bg-gradient-to-b from-white to-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/60 p-6">
        <h1 className="text-2xl font-semibold">GitHub Recent Activity</h1>
        <p className="text-sm text-slate-500 mt-1">Enter a GitHub username to view a timeline.</p>

        <label className="text-xs text-slate-500 block mt-4">Username</label>
        <input
          className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-300"
          placeholder="octocat"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" && user) ? router.push(`/${encodeURIComponent(user)}`) : undefined}
        />

        <button
          className="mt-4 w-full px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 active:opacity-80"
          onClick={() => user && router.push(`/${encodeURIComponent(user)}`)}
        >
          Show Activity
        </button>
      </div>
    </main>
  );
}