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
    <main className="min-h-dvh grid place-items-center p-6 bg-gray-50 dark:bg-gray-950">
      <div
        className="
          w-full max-w-md rounded-2xl
          bg-white dark:bg-gray-900
          border border-gray-200/70 dark:border-gray-700
          shadow-xl shadow-gray-200/20 dark:shadow-none
          p-6
        "
      >
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          GitHub Recent Activity
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter a GitHub username to view a timeline.
        </p>

        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mt-4">
          Username
        </label>
        <input
          className="
            w-full mt-1 px-3 py-2 rounded-lg
            bg-gray-50/50 dark:bg-gray-800
            text-gray-900 placeholder:text-gray-400
            dark:text-white dark:placeholder:text-gray-500
            border border-gray-200 dark:border-gray-600
            outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20
            transition-colors duration-200
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
            bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-900
            dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100
            font-medium
            inline-flex items-center justify-center gap-2
            transition-colors duration-200
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