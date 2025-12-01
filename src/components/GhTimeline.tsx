// src/components/GhTimeline.tsx
"use client";

import { useEffect, useMemo, useState, useTransition, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit, GitPullRequest, Star, GitFork, Tag,
  MessageSquare, GitBranch, GitMerge, Trash2, Users, Eye, Clock,
  RefreshCw, ChevronDown, ChevronRight, Link2, AlertTriangle, Download, Github,
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
    const ref = ev.payload.ref;
    const branch = ref?.startsWith("refs/heads/") ? ref.replace("refs/heads/", "") : ref;
    const head = ev.payload.head;
    const shortSha = head?.slice(0, 7);
    return {
      icon: <GitCommit className="w-4 h-4" />, color: "bg-blue-500/15 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      title: "pushed",
      desc: (
        <span>
          <a className="link font-mono text-xs" href={`${urlRepo}/commit/${head}`} target="_blank" rel="noreferrer">
            {shortSha}
          </a>
          {" to "}
          <a className="link" href={`${urlRepo}/tree/${branch || "main"}`} target="_blank" rel="noreferrer">
            {repo}{branch ? `@${branch}` : ""}
          </a>
        </span>
      ),
    };
  }
  
  if (isPullRequestEvent(ev)) {
    const action = ev.payload.action;
    const pr = ev.payload.pull_request;
    const merged = pr?.merged;
    const title = merged ? "merged a pull request" : `${action} a pull request`;
    return {
      icon: merged ? <GitMerge className="w-4 h-4" /> : <GitPullRequest className="w-4 h-4" />,
      color: merged ? "bg-purple-500/15 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" : "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
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
      color: action === "opened" ? "bg-rose-500/15 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" : "bg-zinc-500/15 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400",
      title: `${action} an issue`,
      desc: (
        <span>
          in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — <a className="link" href={issue?.html_url} target="_blank" rel="noreferrer">#{issue?.number}</a> {issue?.title ? `: ${issue.title}` : ""}
        </span>
      ),
    };
  }
  
  if (isIssueCommentEvent(ev)) {
    const issue = ev.payload.issue;
    const comment = ev.payload.comment;
    const action = ev.payload.action; // created | edited | deleted
    const isPR = !!issue?.pull_request;
    const actionText = action === 'edited' 
      ? 'edited a comment' 
      : action === 'deleted' 
        ? 'deleted a comment' 
        : 'commented';
    const title = `${actionText} on ${isPR ? 'a pull request' : 'an issue'}`;
    return {
      icon: <MessageSquare className="w-4 h-4" />, 
      color: "bg-sky-500/15 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400", 
      title,
      desc: (
        <span>
          in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — <a className="link" href={issue?.html_url} target="_blank" rel="noreferrer">#{issue?.number}</a> {issue?.title ? `: ${issue.title}` : ""}
          {comment?.html_url ? (<>
            {' '}— <a className="link" href={comment.html_url} target="_blank" rel="noreferrer">comment</a>
          </>) : null}
        </span>
      )
    };
  }
  
  if (isPullRequestReviewEvent(ev)) {
    const reviewState = ev.payload.review?.state;
    return { icon: <Eye className="w-4 h-4" />, color: "bg-amber-500/15 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400", title: `reviewed a pull request${reviewState ? ` (${String(reviewState).toLowerCase()})` : ""}`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isReleaseEvent(ev)) {
    const tagName = ev.payload.release?.tag_name;
    return { icon: <Tag className="w-4 h-4" />, color: "bg-fuchsia-500/15 text-fuchsia-600 dark:bg-fuchsia-950/50 dark:text-fuchsia-400", title: "published a release", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — {tagName}</span>) };
  }
  
  if (isForkEvent(ev)) {
    return { icon: <GitFork className="w-4 h-4" />, color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400", title: "forked a repository", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (isWatchEvent(ev)) {
    return { icon: <Star className="w-4 h-4" />, color: "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400", title: "starred a repository", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
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
      color: "bg-teal-500/15 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400", 
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
      color: "bg-zinc-500/15 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400", 
      title: `deleted ${refType}${refName ? ` "${refName}"` : ""}`, 
      desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) 
    };
  }
  
  if (isPublicEvent(ev)) {
    return { icon: <Unlock className="w-4 h-4" />, color: "bg-green-500/15 text-green-600 dark:bg-green-950/50 dark:text-green-400", title: "made repository public", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (isCommitCommentEvent(ev)) {
    const c = ev.payload.comment;
    const sha = c?.commit_id || "";
    const short = sha ? sha.slice(0, 7) : "";
    return { 
      icon: <MessageCircle className="w-4 h-4" />, 
      color: "bg-violet-500/15 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400", 
      title: "commented on a commit", 
      desc: (
        <span>
          in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>
          {sha ? (
            <>
              {' '}— <a className="link" href={`${urlRepo}/commit/${sha}`} target="_blank" rel="noreferrer">{short}</a>
            </>
          ) : null}
          {c?.html_url ? (
            <>
              {' '}— <a className="link" href={c.html_url} target="_blank" rel="noreferrer">comment</a>
            </>
          ) : null}
        </span>
      ) 
    };
  }
  
  if (isGollumEvent(ev)) {
    const pages = ev.payload.pages || [];
    const pageCount = pages.length;
    return { icon: <BookOpen className="w-4 h-4" />, color: "bg-orange-500/15 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400", title: `updated ${pageCount} wiki page${pageCount !== 1 ? 's' : ''}`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isPullRequestReviewCommentEvent(ev)) {
    const pr = ev.payload.pull_request;
    const c = ev.payload.comment;
    return { 
      icon: <MessageCircle className="w-4 h-4" />, 
      color: "bg-pink-500/15 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400", 
      title: "commented on a pull request",
      desc: (
        <span>
          in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — <a className="link" href={pr?.html_url} target="_blank" rel="noreferrer">#{pr?.number}</a> {pr?.title ? `: ${pr.title}` : ""}
          {c?.html_url ? (
            <>
              {' '}— <a className="link" href={c.html_url} target="_blank" rel="noreferrer">comment</a>
            </>
          ) : null}
        </span>
      ) 
    };
  }
  
  if (isPullRequestReviewThreadEvent(ev)) {
    const action = ev.payload.action;
    return { icon: <MessageSquare className="w-4 h-4" />, color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400", title: `${action} review thread`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (isMemberEvent(ev)) {
    return { icon: <Users className="w-4 h-4" />, color: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400", title: "changed collaborators", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  // Default case - should never happen with complete type coverage
  return { icon: <Link2 className="w-4 h-4" />, color: "bg-gray-500/10 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400", title: (ev as GithubEvent).type || "Unknown", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
}

export default function GhTimeline({
  user,
  initial,
  initialTypes = [],
  pollSec = 60,
}: {
  user: string;
  initial: GithubEvent[];
  initialTypes?: string[];
  pollSec?: number;
}) {
  const [events, setEvents] = useState<GithubEvent[]>(initial);
  // Initialize from server-provided initialTypes
  const [allowed, setAllowed] = useState<Set<string>>(() => new Set(initialTypes));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const sp = useSearchParams();

  // Sync allowed set to URL query (?type=...) without triggering a navigation
  useEffect(() => {
    const params = new URLSearchParams(sp?.toString());
    if (allowed.size === 0) {
      params.delete('type');
    } else {
      const list = Array.from(allowed).sort().join(',');
      params.set('type', list);
    }
    const q = params.toString();
    const newUrl = q ? `${window.location.pathname}?${q}` : window.location.pathname;
    if (newUrl !== window.location.pathname + (window.location.search ? `?${window.location.search.slice(1)}` : '')) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [allowed, sp]);

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

      // Determine no next page (less than 100 items = end)
      if (newEvents.length === 0) {
        setHasMore(false);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
        setPage(nextPage);
        // Stop if less than 100 items or after page 3
        if (newEvents.length < 100 || nextPage === 3) {
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
    let intervalId: NodeJS.Timeout | null = null;
    
    const refresh = () => {
      // Only refresh if document is visible
      if (document.visibilityState !== 'visible') return;
      
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
    };
    
    const startInterval = () => {
      // Clear existing interval if any
      if (intervalId) clearInterval(intervalId);
      
      // Start new interval
      intervalId = setInterval(refresh, Math.max(15, pollSec) * 1000);
    };
    
    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Resume refresh when tab becomes visible
        startInterval();
        // Also do an immediate refresh when returning to the tab
        refresh();
      } else {
        // Pause refresh when tab is not visible
        stopInterval();
      }
    };
    
    // Start interval initially if document is visible
    if (document.visibilityState === 'visible') {
      startInterval();
    }
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
    const c = { pushes: 0, prsOpened: 0, prsMerged: 0, issuesOpened: 0, issuesClosed: 0, reviews: 0, stars: 0, forks: 0, releases: 0 };
    // Always calculate from all events, not filtered ones
    for (const e of events) {
      if (isPushEvent(e)) {
        c.pushes++;
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


  return (
    <div className="mx-auto max-w-5xl w-full">
      {/* Header: buttons with opaque white + ring */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {user} — Recent GitHub Activity
          </h1>
          <p className="text-sm text-neutral-600 dark:text-gray-400">Timeline of public (or authorized) events.</p>
        </div>
        <div className="flex gap-2 items-center">
          
          {(() => {
            const list = Array.from(allowed).sort().join(',');
            const rssHref = list ? `/${user}/rss?type=${encodeURIComponent(list)}` : `/${user}/rss`;
            return (
              <a
                href={rssHref}
                className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800/50 text-neutral-700 dark:text-gray-100 border border-neutral-200 dark:border-gray-700/50 hover:bg-gray-50 hover:border-neutral-300 hover:shadow-sm dark:hover:bg-gray-800 inline-flex items-center gap-2 transition-all duration-200"
                title="Subscribe to RSS feed"
              >
                RSS Feed
              </a>
            );
          })()}
          <button
            onClick={onRefresh}
            disabled={isPending}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800/50 text-neutral-700 dark:text-gray-100 border border-neutral-200 dark:border-gray-700/50 hover:bg-gray-50 hover:border-neutral-300 hover:shadow-sm dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            {isPending ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={downloadJson}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800/50 text-neutral-700 dark:text-gray-100 border border-neutral-200 dark:border-gray-700/50 hover:bg-gray-50 hover:border-neutral-300 hover:shadow-sm dark:hover:bg-gray-800 inline-flex items-center gap-2 transition-all duration-200"
          >
            <Download className="w-4 h-4" />Export JSON
          </button>
          <a
            href={`https://github.com/${user}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open @${user} on GitHub`}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800/50 text-neutral-700 dark:text-gray-100 border border-neutral-200 dark:border-gray-700/50 hover:bg-gray-50 hover:border-neutral-300 hover:shadow-sm dark:hover:bg-gray-800 inline-flex items-center gap-2 transition-all duration-200"
          >
            <Github className="w-4 h-4" />View @{user} on GitHub
          </a>
        </div>
      </header>

      {/* Summary cards: opaque white + ring */}
      <section className={`mt-6 grid gap-3 sm:grid-cols-3 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <Stat label="Pushes" value={counters.pushes} icon={<GitCommit className="w-4 h-4" />} />
        <Stat label="PRs (opened/merged)" value={`${counters.prsOpened}/${counters.prsMerged}`} icon={<GitPullRequest className="w-4 h-4" />} />
        <Stat label="Issues (open/closed)" value={`${counters.issuesOpened}/${counters.issuesClosed}`} icon={<AlertTriangle className="w-4 h-4" />} />
        <Stat label="Reviews" value={counters.reviews} icon={<Eye className="w-4 h-4" />} />
        <Stat label="Stars" value={counters.stars} icon={<Star className="w-4 h-4" />} />
        <Stat label="Forks" value={counters.forks} icon={<GitFork className="w-4 h-4" />} />
        <Stat label="Releases" value={counters.releases} icon={<Tag className="w-4 h-4" />} />
      </section>

      {/* Filter card: opaque white + ring */}
      <section className="mt-6 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-neutral-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between gap-3">
          <FilterPillBar allowed={allowed} setAllowed={setAllowed} />
          {error && <div className="text-xs text-rose-600">{error}</div>}
        </div>
      </section>

      {/* Timeline main content */}
      <section className={`mt-6 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {Object.keys(grouped).length === 0 && (
          <div className="text-neutral-500 dark:text-gray-400 text-sm">No events.</div>
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
              <div className="sticky top-0 z-10 py-1 backdrop-blur-sm bg-gradient-to-r from-neutral-50/95 to-white/95 dark:from-gray-900/95 dark:to-gray-950/95">
                <h3 className="text-sm font-semibold text-neutral-600 dark:text-gray-400">{day}</h3>
              </div>
              <ol className="relative ml-3 border-l border-neutral-200 dark:border-gray-700 pl-6">
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
              <div className="flex items-center gap-2 text-neutral-600 dark:text-gray-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading more events...</span>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 dark:text-gray-400">
                Scroll for more
              </div>
            )}
          </div>
        )}
        
        {!hasMore && events.length > 0 && (
          <div className="py-8 text-center text-sm text-neutral-500 dark:text-gray-400">
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
      className="p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-neutral-200 dark:border-gray-700/50 flex items-center gap-3 hover:border-neutral-300 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-800 dark:hover:border-gray-600 transition-all duration-200"
    >
      <div className="p-2 rounded-lg bg-neutral-100 dark:bg-gray-700/50">{icon}</div>
      <div>
        <div className="text-xs text-neutral-600 dark:text-gray-300">{label}</div>
        <div className="text-lg font-semibold text-neutral-900 dark:text-white">{String(value)}</div>
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
            className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
              isSelected
                ? "bg-indigo-600 dark:bg-indigo-500 text-white dark:text-white border-indigo-600 dark:border-indigo-500 shadow-sm shadow-indigo-600/20"
                : "bg-white dark:bg-gray-800/30 text-neutral-700 dark:text-gray-400 border-neutral-300 dark:border-gray-700/50 hover:bg-gray-50 hover:border-neutral-400 dark:hover:bg-gray-800/50"
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
        className="px-3 py-1 rounded-full text-xs bg-white dark:bg-gray-800/30 text-neutral-700 dark:text-gray-400 border border-neutral-300 dark:border-gray-700/50 hover:bg-gray-50 hover:border-neutral-400 dark:hover:bg-gray-800/50 transition-all duration-200"
      >
        Clear
      </button>
    </div>
  );
}

function TimelineItem({ ev }: { ev: GithubEvent }) {
  const meta = eventIconAndText(ev);
  const [open, setOpen] = useState(false);
  const isIssueCmt = isIssueCommentEvent(ev);
  const isCommitCmt = isCommitCommentEvent(ev);
  const isPrReviewCmt = isPullRequestReviewCommentEvent(ev);
  const isPrEvent = isPullRequestEvent(ev);
  const issueCommentBody = isIssueCmt ? (ev.payload.comment?.body || "") : "";
  const commitCommentBody = isCommitCmt ? (ev.payload.comment?.body || "") : "";
  const prReviewCommentBody = isPrReviewCmt ? (ev.payload.comment?.body || "") : "";
  const prBody = isPrEvent ? (ev.payload.pull_request?.body || "") : "";

  return (
    <li className="mb-6">
      <div className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full border-2 border-neutral-200 dark:border-gray-700 bg-white shadow-sm dark:bg-gray-800 dark:shadow-none" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${meta.color}`}>{meta.icon}<span>{ev.type?.replace(/Event$/, "") || "Unknown"}</span></span>
          <span className="text-sm text-neutral-900 dark:text-gray-100">{meta.title} {meta.desc}</span>
        </div>
        <div className="text-xs text-neutral-600 dark:text-slate-400 flex items-center gap-2">
          <Clock className="w-3 h-3" /> {ev.created_at ? fmtRel(ev.created_at) : "Unknown"}
          <a className="link" href={`https://github.com/${ev.actor?.login}`} target="_blank" rel="noreferrer">@{ev.actor?.login}</a>
          <span className="text-neutral-300 dark:text-gray-600">•</span> id: {ev.id}
        </div>

        {isIssueCmt && ev.payload.action !== 'deleted' && issueCommentBody && (
          <div className="pl-6">
            {issueCommentBody.length > 320 ? (
              <div className="mt-1">
                <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-gray-100">
                  {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {open ? "Hide" : "Show"} comment
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="mt-2 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                        {issueCommentBody}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-1 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                {issueCommentBody}
              </div>
            )}
          </div>
        )}

        {isPrEvent && prBody && (
          <div className="pl-6">
            {prBody.length > 320 ? (
              <div className="mt-1">
                <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-gray-100">
                  {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {open ? "Hide" : "Show"} description
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="mt-2 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                        {prBody}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-1 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                {prBody}
              </div>
            )}
          </div>
        )}

        {isCommitCmt && commitCommentBody && (
          <div className="pl-6">
            {commitCommentBody.length > 320 ? (
              <div className="mt-1">
                <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-gray-100">
                  {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {open ? "Hide" : "Show"} comment
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="mt-2 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                        {commitCommentBody}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-1 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                {commitCommentBody}
              </div>
            )}
          </div>
        )}

        {isPrReviewCmt && prReviewCommentBody && (
          <div className="pl-6">
            {prReviewCommentBody.length > 320 ? (
              <div className="mt-1">
                <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-gray-100">
                  {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {open ? "Hide" : "Show"} comment
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="mt-2 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                        {prReviewCommentBody}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-1 rounded-lg p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-800 text-xs whitespace-pre-wrap break-words">
                {prReviewCommentBody}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
