// src/components/GhTimeline.tsx
"use client";

import { useEffect, useMemo, useState, useTransition, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit, GitPullRequest, Star, GitFork, Tag,
  MessageSquare, GitBranch, GitMerge, Trash2, Users, Eye, Clock,
  RefreshCw, ChevronDown, ChevronRight, Link2, AlertTriangle, Download, Copy,
  Unlock, BookOpen, MessageCircle
} from "lucide-react";
import { getEventsAction } from "@/app/[user]/actions";
import type { GithubEvent } from "@/app/[user]/shared";
import { 
  isPushEvent, isPullRequestEvent, isIssuesEvent, isIssueCommentEvent,
  isPullRequestReviewEvent, isReleaseEvent, isForkEvent, isWatchEvent,
  isCreateEvent, isDeleteEvent, isMemberEvent, isPublicEvent,
  isCommitCommentEvent, isGollumEvent, isPullRequestReviewCommentEvent,
  isPullRequestReviewThreadEvent
} from "@/lib/github-events-schema";

function fmtRel(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const mins = Math.floor(sec / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (sec < 60) return `${sec}s ago`;
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

const TYPE_LABELS = [
  "PushEvent", "PullRequestEvent", "IssuesEvent", "IssueCommentEvent",
  "PullRequestReviewEvent", "PullRequestReviewCommentEvent", "PullRequestReviewThreadEvent",
  "ReleaseEvent", "ForkEvent", "WatchEvent", "CreateEvent", "DeleteEvent", 
  "PublicEvent", "MemberEvent", "CommitCommentEvent", "GollumEvent",
] as const;

function eventIconAndText(ev: GithubEvent) {
  const repo = ev.repo?.name;
  const urlRepo = `https://github.com/${repo}`;

  if (isPushEvent(ev)) {
    const commits = ev.payload.commits || [];
    const count = commits.length;
    const ref = ev.payload.ref;
    const branch = ref?.startsWith("refs/heads/") ? ref.replace("refs/heads/", "") : ref;
    return {
      icon: <GitCommit className="w-4 h-4" />, color: "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      title: `pushed ${count} commit${count !== 1 ? "s" : ""}`,
      desc: (
        <span>
          to <a className="link" href={`${urlRepo}/tree/${branch || "main"}`} target="_blank" rel="noreferrer">
            {repo}{branch ? `@${branch}` : ""}
          </a>
        </span>
      ),
      extra: commits.map(c => ({ sha: c.sha, msg: c.message })),
    };
  }
  
  if (isPullRequestEvent(ev)) {
    const action = ev.payload.action;
    const pr = ev.payload.pull_request;
    const merged = pr?.merged;
    const title = merged ? "merged a pull request" : `${action} a pull request`;
    return {
      icon: merged ? <GitMerge className="w-4 h-4" /> : <GitPullRequest className="w-4 h-4" />,
      color: merged ? "bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" : "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      title,
      desc: (
        <span>
          in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — <a className="link" href={pr?.html_url} target="_blank" rel="noreferrer">#{pr?.number}</a> {pr?.title ? `: ${pr.title}` : ""}
        </span>
      ),
    };
  }
  
  if (isIssuesEvent(ev)) {
    const issue = ev.payload.issue;
    const action = ev.payload.action;
    return {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: action === "opened" ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" : "bg-zinc-500/15 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400",
      title: `${action} an issue`,
      desc: (
        <span>
          in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — <a className="link" href={issue?.html_url} target="_blank" rel="noreferrer">#{issue?.number}</a> {issue?.title ? `: ${issue.title}` : ""}
        </span>
      ),
    };
  }
  
  if (isIssueCommentEvent(ev)) {
    return { icon: <MessageSquare className="w-4 h-4" />, color: "bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400", title: "commented on an issue", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isPullRequestReviewEvent(ev)) {
    const reviewState = ev.payload.review?.state;
    return { icon: <Eye className="w-4 h-4" />, color: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", title: `reviewed a pull request${reviewState ? ` (${String(reviewState).toLowerCase()})` : ""}`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isReleaseEvent(ev)) {
    const tagName = ev.payload.release?.tag_name;
    return { icon: <Tag className="w-4 h-4" />, color: "bg-fuchsia-500/15 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400", title: "published a release", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — {tagName}</span>) };
  }
  
  if (isForkEvent(ev)) {
    return { icon: <GitFork className="w-4 h-4" />, color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400", title: "forked a repository", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (isWatchEvent(ev)) {
    return { icon: <Star className="w-4 h-4" />, color: "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", title: "starred a repository", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (isCreateEvent(ev)) {
    const refType = ev.payload.ref_type;
    const refName = ev.payload.ref;
    const refUrl = refType === "branch" 
      ? `${urlRepo}/tree/${refName}`
      : refType === "tag"
      ? `${urlRepo}/releases/tag/${refName}`
      : urlRepo;
    return { 
      icon: <GitBranch className="w-4 h-4" />, 
      color: "bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400", 
      title: refName ? (
        <>
          created {refType} &quot;<a className="link" href={refUrl} target="_blank" rel="noreferrer">{refName}</a>&quot;
        </>
      ) : `created ${refType}`, 
      desc: (
        <span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>
      ) 
    };
  }
  
  if (isDeleteEvent(ev)) {
    const refType = ev.payload.ref_type;
    const refName = ev.payload.ref;
    return { 
      icon: <Trash2 className="w-4 h-4" />, 
      color: "bg-zinc-500/15 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400", 
      title: `deleted ${refType}${refName ? ` "${refName}"` : ""}`, 
      desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) 
    };
  }
  
  if (isPublicEvent(ev)) {
    return { icon: <Unlock className="w-4 h-4" />, color: "bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400", title: "made repository public", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (isCommitCommentEvent(ev)) {
    return { icon: <MessageCircle className="w-4 h-4" />, color: "bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", title: "commented on a commit", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isGollumEvent(ev)) {
    const pages = ev.payload.pages || [];
    const pageCount = pages.length;
    return { icon: <BookOpen className="w-4 h-4" />, color: "bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400", title: `updated ${pageCount} wiki page${pageCount !== 1 ? 's' : ''}`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isPullRequestReviewCommentEvent(ev)) {
    return { icon: <MessageCircle className="w-4 h-4" />, color: "bg-pink-500/15 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400", title: "commented on PR review", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isPullRequestReviewThreadEvent(ev)) {
    const action = ev.payload.action;
    return { icon: <MessageSquare className="w-4 h-4" />, color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400", title: `${action} review thread`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isMemberEvent(ev)) {
    return { icon: <Users className="w-4 h-4" />, color: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", title: "changed collaborators", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  // Default case - should never happen with complete type coverage
  return { icon: <Link2 className="w-4 h-4" />, color: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400", title: (ev as GithubEvent).type || "Unknown", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
}

export default function GhTimeline({
  user,
  initial,
  pollSec = 60,
}: {
  user: string;
  initial: GithubEvent[];
  pollSec?: number;
}) {
  const [events, setEvents] = useState<GithubEvent[]>(initial);
  const [allowed, setAllowed] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load more events (GitHub API limits to 300 events total)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      // GitHub API limits to 300 events (3 pages × 100 events/page)
      if (nextPage > 3) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }
      
      const { events: newEvents } = await getEventsAction(user, nextPage);
      
      if (newEvents.length === 0) {
        setHasMore(false);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
        setPage(nextPage);
        // After loading page 3, no more pages available
        if (nextPage === 3) {
          setHasMore(false);
        }
      }
    } catch (e) {
      console.error('Failed to load more events:', e);
      // If we hit the pagination limit, stop trying to load more
      if (e instanceof Error && e.message.includes('pagination is limited')) {
        setHasMore(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, page, isLoadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, isLoadingMore, hasMore]);

  // Auto-refresh first page only (preserves loaded pages)
  useEffect(() => {
    const t = setInterval(() => {
      startTransition(async () => {
        try {
          const { events: newEvents } = await getEventsAction(user, 1);
          // Update only the first 100 events to preserve pagination
          setEvents(prev => {
            if (page === 1) {
              // If only showing first page, replace all
              return newEvents;
            } else {
              // If showing multiple pages, update first 100 and keep the rest
              return [...newEvents, ...prev.slice(100)];
            }
          });
        } catch {
          // Silent fail for background refresh
        }
      });
    }, Math.max(15, pollSec) * 1000);
    return () => clearInterval(t);
  }, [user, pollSec, page]);

  const filtered = useMemo(() => (allowed.size === 0 ? events : events.filter(e => e.type && allowed.has(e.type))), [events, allowed]);

  const grouped = useMemo(() => {
    const g: Record<string, GithubEvent[]> = {};
    for (const e of filtered) {
      if (!e.created_at) continue;
      const k = new Date(e.created_at).toDateString();
      (g[k] ||= []).push(e);
    }
    return g;
  }, [filtered]);

  const counters = useMemo(() => {
    const c = { commits: 0, prsOpened: 0, prsMerged: 0, issuesOpened: 0, issuesClosed: 0, reviews: 0, stars: 0, forks: 0, releases: 0 };
    // Always calculate from all events, not filtered ones
    for (const e of events) {
      if (isPushEvent(e)) {
        c.commits += e.payload.commits?.length || 0;
      } else if (isPullRequestEvent(e)) {
        const pr = e.payload.pull_request;
        const action = e.payload.action;
        if (pr?.merged) {
          c.prsMerged++;
        } else if (action === "opened") {
          c.prsOpened++;
        }
      } else if (isIssuesEvent(e)) {
        const action = e.payload.action;
        if (action === "opened") {
          c.issuesOpened++;
        } else if (action === "closed") {
          c.issuesClosed++;
        }
      } else if (isPullRequestReviewEvent(e)) {
        c.reviews++;
      } else if (isWatchEvent(e)) {
        c.stars++;
      } else if (isForkEvent(e)) {
        c.forks++;
      } else if (isReleaseEvent(e)) {
        c.releases++;
      }
    }
    return c;
  }, [events]);

  const onRefresh = () => {
    startTransition(async () => {
      try {
        setError("");
        const { events } = await getEventsAction(user, 1);
        setEvents(events);
        setPage(1);
        setHasMore(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${user}-events.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyCount = async () => {
    await navigator.clipboard.writeText(String(events.length));
  };

  return (
    <div className="mx-auto max-w-5xl w-full">
      {/* Header: buttons with opaque white + ring */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
            {user} — Recent GitHub Activity
            {isPending && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Refreshing data..." />
            )}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Timeline of public (or authorized) events.</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onRefresh}
            disabled={isPending}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-opacity"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={downloadJson}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />Export JSON
          </button>
          <button
            onClick={copyCount}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />Copy count
          </button>
        </div>
      </header>

      {/* Summary cards: opaque white + ring */}
      <section className={`mt-6 grid gap-3 sm:grid-cols-3 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <Stat label="Commits" value={counters.commits} icon={<GitCommit className="w-4 h-4" />} />
        <Stat label="PRs (opened/merged)" value={`${counters.prsOpened}/${counters.prsMerged}`} icon={<GitPullRequest className="w-4 h-4" />} />
        <Stat label="Issues (open/closed)" value={`${counters.issuesOpened}/${counters.issuesClosed}`} icon={<AlertTriangle className="w-4 h-4" />} />
        <Stat label="Reviews" value={counters.reviews} icon={<Eye className="w-4 h-4" />} />
        <Stat label="Stars" value={counters.stars} icon={<Star className="w-4 h-4" />} />
        <Stat label="Forks" value={counters.forks} icon={<GitFork className="w-4 h-4" />} />
        <Stat label="Releases" value={counters.releases} icon={<Tag className="w-4 h-4" />} />
      </section>

      {/* Filter card: opaque white + ring */}
      <section className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <FilterPillBar allowed={allowed} setAllowed={setAllowed} />
          {error && <div className="text-xs text-rose-600">{error}</div>}
        </div>
      </section>

      {/* Timeline main content */}
      <section className={`mt-6 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {Object.keys(grouped).length === 0 && (
          <div className="text-slate-500 dark:text-slate-400 text-sm">No events.</div>
        )}

        <div className="space-y-8">
          {Object.entries(grouped)
            .sort((a, b) => {
              const dateA = new Date(a[0]);
              const dateB = new Date(b[0]);
              return dateB.valueOf() - dateA.valueOf();
            })
            .map(([day, items]) => (
            <div key={day}>
              <div className="sticky top-0 z-10 py-1 backdrop-blur bg-slate-50/90 dark:bg-slate-900/90">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{day}</h3>
              </div>
              <ol className="relative ml-3 border-l border-slate-200 dark:border-slate-700 pl-6">
                {items
                  .sort((a, b) => {
                    if (!a.created_at || !b.created_at) return 0;
                    return new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
                  })
                  .map((ev) => (
                  <TimelineItem key={ev.id} ev={ev} />
                ))}
              </ol>
            </div>
          ))}
        </div>
        
        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerTarget} className="py-8 flex justify-center">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading more events...</span>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Scroll for more
              </div>
            )}
          </div>
        )}
        
        {!hasMore && events.length > 0 && (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {page >= 3 
              ? "Reached GitHub API limit (max 300 events)" 
              : "No more events to load"}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <motion.div
      layout
      className="p-4 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center gap-3"
    >
      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{icon}</div>
      <div>
        <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{String(value)}</div>
      </div>
    </motion.div>
  );
}

function FilterPillBar({
  allowed, setAllowed,
}: {
  allowed: Set<string>;
  setAllowed: (s: Set<string>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPE_LABELS.map((t) => {
        const active = allowed.size === 0 || allowed.has(t);
        const isSelected = allowed.has(t);
        return (
          <button
            key={t}
            onClick={() => {
              const n = new Set(allowed);
              if (n.has(t)) n.delete(t); else n.add(t);
              setAllowed(n);
            }}
            className={`px-3 py-1 rounded-full text-xs ring-1 ${
              isSelected
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ring-slate-900 dark:ring-slate-100"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            aria-pressed={isSelected}
            title={active ? `Filter: showing ${t}` : `Filter: hidden ${t}`}
          >
            {t}
          </button>
        );
      })}
      <button
        onClick={() => setAllowed(new Set())}
        className="px-3 py-1 rounded-full text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        Clear
      </button>
    </div>
  );
}

function TimelineItem({ ev }: { ev: GithubEvent }) {
  const meta = eventIconAndText(ev);
  const [open, setOpen] = useState(false);
  const commits = isPushEvent(ev) ? (ev.payload.commits || []) : [];

  return (
    <li className="mb-6">
      <div className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${meta.color}`}>{meta.icon}<span>{ev.type?.replace(/Event$/, "") || "Unknown"}</span></span>
          <span className="text-sm text-slate-900 dark:text-slate-100">{meta.title} {meta.desc}</span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Clock className="w-3 h-3" /> {ev.created_at ? fmtRel(ev.created_at) : "Unknown"}
          <a className="link" href={`https://github.com/${ev.actor?.login}`} target="_blank" rel="noreferrer">@{ev.actor?.login}</a>
          <span className="text-slate-300 dark:text-slate-600">•</span> id: {ev.id}
        </div>

        {isPushEvent(ev) && commits.length > 0 && (
          <div className="pl-6">
            <button onClick={() => setOpen(v => !v)} className="mt-1 inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
              {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {open ? "Hide" : "Show"} commits ({commits.length})
            </button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <ul className="mt-2 space-y-1 text-xs">
                    {commits.map(c => (
                      <li key={c.sha} className="rounded-lg p-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <a 
                          href={`https://github.com/${ev.repo?.name}/commit/${c.sha}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          {c.sha.slice(0, 7)}
                        </a>
                        <span className="ml-2 whitespace-pre-wrap break-words">{c.message}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </li>
  );
}