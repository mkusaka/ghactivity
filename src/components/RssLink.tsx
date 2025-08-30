// src/components/RssLink.tsx
"use client";

import { Rss } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function RssLink({ user }: { user: string }) {
  const sp = useSearchParams();
  const type = sp?.get('type');
  const href = `/${user}/rss${type ? `?type=${encodeURIComponent(type)}` : ''}`;
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-neutral-700 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-gray-100"
      aria-label={`RSS feed for @${user}`}
      title="Subscribe to RSS feed"
    >
      <Rss className="w-4 h-4" />
      <span>RSS Feed</span>
    </a>
  );
}

