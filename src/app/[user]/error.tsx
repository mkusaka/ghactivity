// src/app/[user]/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isRateLimit = error.message.includes("rate limit");
  const isNotFound = error.message.includes("not found");

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-2xl p-6 pt-20">
        <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {isRateLimit ? "API Rate Limit Exceeded" : isNotFound ? "User Not Found" : "Something went wrong"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {error.message}
              </p>
              
              {isRateLimit && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">How to fix this:</h3>
                  <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Create a GitHub Personal Access Token at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="link">github.com/settings/tokens</a></li>
                    <li>Copy <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">.dev.vars.example</code> to <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">.dev.vars</code></li>
                    <li>Add your token: <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">GITHUB_PAT=your_token_here</code></li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              )}

              <button
                onClick={reset}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-95 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}