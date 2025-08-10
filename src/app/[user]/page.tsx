// src/app/[user]/page.tsx
import { getEventsAction } from "./actions";
import GhTimeline from "@/components/GhTimeline";
import { fetchEventsWithEnv } from "./shared";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";

export const runtime = "nodejs";

export default async function UserPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const { events, meta } = await getEventsAction(user);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-5xl p-6">
        <GhTimeline user={user} initial={events} pollSec={meta.pollInterval ?? 60} />
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ user: string }> }): Promise<Metadata> {
  // Lightweight fetch for metadata (reusing the same function)
  const { user } = await params;
  const { env } = getCloudflareContext();
  const { events } = await fetchEventsWithEnv(env as any, user);

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
  };
}