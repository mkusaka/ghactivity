// src/app/[user]/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type ErrorType = "rate_limit" | "not_found" | "schema" | "unknown";

function detectErrorType(message: string): ErrorType {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("rate limit") || message.includes("403")) {
    return "rate_limit";
  }
  if (lowerMessage.includes("not found") && message.includes("404")) {
    return "not_found";
  }
  if (message.includes("SCHEMA_ERROR") || lowerMessage.includes("invalid github api response")) {
    return "schema";
  }
  return "unknown";
}

const ERROR_CONFIG: Record<ErrorType, { title: string; getMessage: (username: string, originalMessage: string) => string }> = {
  rate_limit: {
    title: "API Rate Limit Exceeded",
    getMessage: () => "GitHub API rate limit has been exceeded. Please try again later.",
  },
  not_found: {
    title: "User Not Found",
    getMessage: (username) => `The user "${username}" could not be found on GitHub. Please check the username and try again.`,
  },
  schema: {
    title: "Data Format Error",
    getMessage: () => "The GitHub API response format has changed. This is a bug in the application. Please report this issue.",
  },
  unknown: {
    title: "Something went wrong",
    getMessage: (_, originalMessage) => originalMessage || "An error occurred while fetching GitHub activity. Please try again.",
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const username = params?.user as string;
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const errorMessage = error.message || "";
  const errorType = detectErrorType(errorMessage);
  const config = ERROR_CONFIG[errorType];

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
                {config.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {config.getMessage(username, errorMessage)}
              </p>

              {errorType === "not_found" ? (
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-95 inline-flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-95 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
