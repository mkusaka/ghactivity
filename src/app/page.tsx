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
    <main className="min-h-dvh grid place-items-center p-6 bg-neutral-50 dark:bg-gray-950">
      <div
        className="
          w-full max-w-md rounded-2xl
          bg-white dark:bg-gray-900
          border border-neutral-200 dark:border-gray-700
          shadow-lg shadow-neutral-900/5 dark:shadow-none
          p-6
        "
      >
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          GitHub Recent Activity
        </h1>
        <p className="text-sm text-neutral-600 dark:text-gray-400 mt-1">
          Enter a GitHub username to view a timeline.
        </p>

        <label className="text-xs font-medium text-neutral-700 dark:text-gray-300 block mt-4">
          Username
        </label>
        <input
          className="
            w-full mt-1 px-3 py-2 rounded-lg
            bg-neutral-50 dark:bg-gray-800
            text-neutral-900 dark:text-white
            placeholder:text-neutral-500 dark:placeholder:text-gray-500
            border border-neutral-200 dark:border-gray-600
            outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20
            transition-all duration-200
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
            mt-4 w-full px-4 py-2.5 rounded-lg
            bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-900 shadow-sm
            dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100
            font-medium
            inline-flex items-center justify-center gap-2
            transition-all duration-200
            ${isPending ? 'opacity-60 cursor-not-allowed' : ''}
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