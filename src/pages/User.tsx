// src/pages/User.tsx
import { Deferred, Head, Link } from "@inertiajs/react";
import GhTimeline from "@/components/GhTimeline";
import TimelineSkeleton from "@/components/TimelineSkeleton";
import UserError from "@/components/UserError";
import type { GithubEvent } from "@/lib/github-events-schema";

type Timeline = { events: GithubEvent[]; pollSec: number } | { error: string };

export default function User({ title, user, initialTypes, initialOwnership, timeline }: {
  title: string;
  user: string;
  initialTypes: string[];
  initialOwnership?: string;
  timeline?: Timeline;
}) {
  if (timeline && "error" in timeline) {
    return <UserError title={title} user={user} message={timeline.error} />;
  }

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
        <Deferred data="timeline" fallback={<TimelineSkeleton />}>
          {timeline && <GhTimeline user={user} initial={timeline.events} initialTypes={initialTypes} initialOwnership={initialOwnership} pollSec={timeline.pollSec} />}
        </Deferred>
      </div>
    </main>
  );
}
