// src/pages/User.tsx
import { Head, Link } from "@inertiajs/react";
import GhTimeline from "@/components/GhTimeline";
import type { GithubEvent } from "@/lib/github-events-schema";

export default function User({ title, user, events, initialTypes, initialOwnership, pollSec }: {
  title: string;
  user: string;
  events: GithubEvent[];
  initialTypes: string[];
  initialOwnership?: string;
  pollSec: number;
}) {
  return (
    <main className="dot-grid min-h-dvh text-ink">
      <Head title={title} />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/"
          className="inline-block font-mono text-sm font-semibold tracking-[0.1em] text-ink-3 hover:text-accent transition-colors mb-6"
        >
          ghactivity
        </Link>
        <GhTimeline user={user} initial={events} initialTypes={initialTypes} initialOwnership={initialOwnership} pollSec={pollSec} />
      </div>
    </main>
  );
}
