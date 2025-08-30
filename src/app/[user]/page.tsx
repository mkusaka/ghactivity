// src/app/[user]/page.tsx
import { getEventsAction } from "./actions";
import GhTimeline from "@/components/GhTimeline";
import { fetchEventsWithEnv } from "./shared";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";

export const runtime = "nodejs";

export default async function UserPage({ params, searchParams }: { params: Promise<{ user: string }>; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { user } = await params;
  const sp = searchParams ? await searchParams : {};
  const typeParam = typeof sp?.type === 'string' ? sp.type : Array.isArray(sp?.type) ? sp.type.join(',') : undefined;
  const initialTypes = typeParam ? typeParam.split(',').map(s => s.trim()).filter(Boolean) : [];

  const { events, meta } = await getEventsAction(user);
  const filteredInitial = initialTypes.length > 0
    ? events.filter(e => e.type && initialTypes.includes(e.type))
    : events;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-neutral-50 to-white dark:from-gray-900 dark:to-gray-950 text-neutral-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center gap-4">
          <a
            href={`https://github.com/${user}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-gray-100 underline underline-offset-2"
            aria-label={`Open @${user} on GitHub`}
          >
            View @{user} on GitHub
          </a>
          {/* RSS link is now rendered inside GhTimeline to reflect live filters */}
        </div>
        <GhTimeline user={user} initial={filteredInitial} initialTypes={initialTypes} pollSec={meta.pollInterval ?? 60} />
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ user: string }> }): Promise<Metadata> {
  // Lightweight fetch for metadata (reusing the same function)
  const { user } = await params;
  const { env } = getCloudflareContext();
  const { events } = await fetchEventsWithEnv(env, user);

  const first = events?.[0];
  const title = `${user} — Recent GitHub Activity`;
  const desc =
    first?.type && first?.repo?.name
      ? `Latest: ${first.type.replace(/Event$/, "")} in ${first.repo.name}`
      : `Latest public events by ${user}`;

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: "website", url: `/${user}` },
    twitter: { card: "summary_large_image", title, description: desc },
    alternates: {
      types: {
        'application/rss+xml': `/${user}/rss`,
      },
    },
  };
}
