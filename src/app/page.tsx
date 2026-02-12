// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const go = () => {
    if (user.trim() && !isPending) {
      startTransition(() => {
        router.push(`/${encodeURIComponent(user.trim())}`);
      });
    }
  };

  return (
    <main className="dot-grid min-h-dvh flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm"
      >
        <h1 className="font-mono text-[1.7rem] sm:text-3xl font-semibold tracking-[0.1em] text-center text-ink mb-1">
          ghactivity
        </h1>
        <p className="text-center text-sm text-ink-2 mb-8">
          Explore anyone&apos;s GitHub timeline
        </p>

        <div className="bg-surface border border-line rounded-xl p-5">
          <label
            htmlFor="username-input"
            className="block text-[11px] font-medium tracking-[0.08em] uppercase text-ink-3 mb-2"
          >
            Username
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-accent text-lg leading-none select-none"
              aria-hidden="true"
            >
              &#x203A;
            </span>
            <input
              id="username-input"
              className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-canvas border border-line font-mono text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none transition-colors"
              placeholder="octocat"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") go();
              }}
              disabled={isPending}
              aria-label="GitHub username"
            />
          </div>

          <button
            className="mt-4 w-full py-2.5 rounded-lg bg-accent text-accent-on font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-accent-h active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            onClick={go}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {isPending ? "Loading\u2026" : "View Activity"}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-3">
          Press{" "}
          <kbd className="inline-block px-1.5 py-0.5 rounded border border-line bg-surface font-mono text-[10px] text-ink-2">
            Enter &#x21B5;
          </kbd>{" "}
          to search
        </p>
      </motion.div>
    </main>
  );
}
