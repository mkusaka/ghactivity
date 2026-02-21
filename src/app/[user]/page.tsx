// src/app/[user]/page.tsx
import { getEventsAction } from "./actions";
import GhTimeline from "@/components/GhTimeline";
import { fetchEventsWithEnv } from "./shared";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";

export default async function UserPage({ params, searchParams }: { params: Promise<{ user: string }>; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { user } = await params;
  const sp = searchParams ? await searchParams : {};
  const typeParam = typeof sp?.type === 'string' ? sp.type : Array.isArray(sp?.type) ? sp.type.join(',') : undefined;
  const initialTypes = typeParam ? typeParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const ownershipParam = typeof sp?.ownership === 'string' ? sp.ownership : undefined;

  const { events, meta } = await getEventsAction(user);

  return (
    <main className="dot-grid min-h-dvh text-ink">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/"
          className="inline-block font-mono text-sm font-semibold tracking-[0.1em] text-ink-3 hover:text-accent transition-colors mb-6"
        >
          ghactivity
        </Link>
        <GhTimeline user={user} initial={events} initialTypes={initialTypes} initialOwnership={ownershipParam} pollSec={meta.pollInterval ?? 60} />
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ user: string }> }): Promise<Metadata> {
  const { user } = await params;
  const { env } = getCloudflareContext();
  const { events } = await fetchEventsWithEnv(env, user);

  const first = events?.[0];
  const title = `${user} \u2014 ghactivity`;
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
