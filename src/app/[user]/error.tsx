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
    <main className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-lg px-6 pt-24">
        <div className="bg-surface border border-line rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-rose-500/10">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-ink mb-1.5">
                {config.title}
              </h2>
              <p className="text-sm text-ink-2 mb-4">
                {config.getMessage(username, errorMessage)}
              </p>

              {errorType === "not_found" ? (
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-on text-sm font-medium hover:bg-accent-h inline-flex items-center gap-2 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-accent text-accent-on text-sm font-medium hover:bg-accent-h inline-flex items-center gap-2 transition-colors"
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
