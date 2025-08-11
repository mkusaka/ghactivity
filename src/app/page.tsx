// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState("mkusaka");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <main className="min-h-dvh grid place-items-center p-6 bg-gradient-to-br from-stone-50 via-white to-amber-50/20 dark:from-slate-900 dark:to-slate-950">
      <div
        className="
          w-full max-w-md rounded-2xl
          bg-white/90 dark:bg-slate-900
          backdrop-blur-sm
          shadow-lg shadow-stone-200/50 dark:shadow-none
          ring-1 ring-stone-200/60 dark:ring-slate-800
          p-6
        "
      >
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-slate-100">
          GitHub Recent Activity
        </h1>
        <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
          Enter a GitHub username to view a timeline.
        </p>

        <label className="text-xs text-stone-700 dark:text-slate-300 block mt-4">
          Username
        </label>
        <input
          className="
            w-full mt-1 px-3 py-2 rounded-xl
            bg-stone-50/50 dark:bg-slate-900
            text-stone-900 placeholder:text-stone-400
            dark:text-slate-100 dark:placeholder:text-slate-500
            ring-1 ring-stone-200 dark:ring-slate-700
            outline-none focus:ring-2 focus:ring-amber-500/40 dark:focus:ring-slate-400/60
          "
          placeholder="octocat"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && user && !isPending) {
              startTransition(() => {
                router.push(`/${encodeURIComponent(user)}`);
              });
            }
          }}
          aria-label="GitHub username"
          disabled={isPending}
        />

        <button
          className={`
            mt-4 w-full px-4 py-2 rounded-xl
            bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:opacity-95 active:opacity-90
            dark:bg-slate-100 dark:text-slate-900
            shadow-md shadow-stone-300/50 dark:shadow-none
            inline-flex items-center justify-center gap-2
            transition-all
            ${isPending ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          onClick={() => {
            if (user && !isPending) {
              startTransition(() => {
                router.push(`/${encodeURIComponent(user)}`);
              });
            }
          }}
          disabled={isPending}
        >
          {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
          {isPending ? 'Loading...' : 'Show Activity'}
        </button>
      </div>
    </main>
  );
}