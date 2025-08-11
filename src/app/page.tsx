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
    <main className="min-h-dvh grid place-items-center p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div
        className="
          w-full max-w-md rounded-2xl
          bg-white dark:bg-slate-900
          shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800
          p-6
        "
      >
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          GitHub Recent Activity
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter a GitHub username to view a timeline.
        </p>

        <label className="text-xs text-slate-700 dark:text-slate-300 block mt-4">
          Username
        </label>
        <input
          className="
            w-full mt-1 px-3 py-2 rounded-xl
            bg-white dark:bg-slate-900
            text-slate-900 placeholder:text-slate-400
            dark:text-slate-100 dark:placeholder:text-slate-500
            ring-1 ring-slate-300 dark:ring-slate-700
            outline-none focus:ring-2 focus:ring-slate-500/60 dark:focus:ring-slate-400/60
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
            bg-slate-900 text-white hover:opacity-95 active:opacity-90
            dark:bg-slate-100 dark:text-slate-900
            shadow-sm
            inline-flex items-center justify-center gap-2
            transition-opacity
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