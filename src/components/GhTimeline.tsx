// src/components/GhTimeline.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit, GitPullRequest, Star, GitFork, Tag,
  MessageSquare, GitBranch, GitMerge, Trash2, Users, Eye, Clock,
  RefreshCw, ChevronDown, ChevronRight, Filter, Link2, AlertTriangle, Download, Copy
} from "lucide-react";
import { getEventsAction } from "@/app/[user]/actions";
import type { GithubEvent } from "@/app/[user]/shared";

// Due to limitations in Octokit types, payload properties aren't properly narrowed
// based on event type. We need to access them with @ts-expect-error comments.
// This is a known issue: the payload is a union type but doesn't narrow correctly
// when checking event.type

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
  "PullRequestReviewEvent", "ReleaseEvent", "ForkEvent", "WatchEvent",
  "CreateEvent", "DeleteEvent", "MemberEvent",
] as const;

function eventIconAndText(ev: GithubEvent) {
  const repo = ev.repo?.name;
  const urlRepo = `https://github.com/${repo}`;
  const payload = ev.payload;

  if (ev.type === "PushEvent") {
    // @ts-expect-error - Octokit types don't narrow payload based on event type
    const commits = payload.commits || [];
    const count = commits.length;
    // @ts-expect-error
    const ref = payload.ref;
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
      extra: commits.map((c: { sha: string; message: string }) => ({ sha: c.sha, msg: c.message })),
    };
  }
  
  if (ev.type === "PullRequestEvent") {
    const action = payload.action;
    // @ts-expect-error
    const pr = payload.pull_request;
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
  
  if (ev.type === "IssuesEvent") {
    const issue = payload.issue;
    const action = payload.action;
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
  
  if (ev.type === "IssueCommentEvent") {
    return { icon: <MessageSquare className="w-4 h-4" />, color: "bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400", title: "commented on an issue", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (ev.type === "PullRequestReviewEvent") {
    // @ts-expect-error
    const reviewState = payload.review?.state;
    return { icon: <Eye className="w-4 h-4" />, color: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", title: `reviewed a pull request${reviewState ? ` (${String(reviewState).toLowerCase()})` : ""}`, desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) };
  }
  
  if (ev.type === "ReleaseEvent") {
    // @ts-expect-error
    const tagName = payload.release?.tag_name;
    return { icon: <Tag className="w-4 h-4" />, color: "bg-fuchsia-500/15 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400", title: "published a release", desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a> — {tagName}</span>) };
  }
  
  if (ev.type === "ForkEvent") {
    return { icon: <GitFork className="w-4 h-4" />, color: "bg-indigo-500/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400", title: "forked a repository", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (ev.type === "WatchEvent") {
    return { icon: <Star className="w-4 h-4" />, color: "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", title: "starred a repository", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  if (ev.type === "CreateEvent") {
    // @ts-expect-error
    const refType = payload.ref_type;
    // @ts-expect-error
    const refName = payload.ref;
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
          created {refType} "<a className="link" href={refUrl} target="_blank" rel="noreferrer">{refName}</a>"
        </>
      ) : `created ${refType}`, 
      desc: (
        <span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>
      ) 
    };
  }
  
  if (ev.type === "DeleteEvent") {
    // @ts-expect-error
    const refType = payload.ref_type;
    // @ts-expect-error
    const refName = payload.ref;
    return { 
      icon: <Trash2 className="w-4 h-4" />, 
      color: "bg-zinc-500/15 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400", 
      title: `deleted ${refType}${refName ? ` "${refName}"` : ""}`, 
      desc: (<span>in <a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a></span>) 
    };
  }
  
  if (ev.type === "MemberEvent") {
    return { icon: <Users className="w-4 h-4" />, color: "bg-cyan-500/15 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", title: "changed collaborators", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
  }
  
  // Default case
  return { icon: <Link2 className="w-4 h-4" />, color: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400", title: ev.type || "Unknown", desc: (<a className="link" href={urlRepo} target="_blank" rel="noreferrer">{repo}</a>) };
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
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState<Set<string>>(new Set());
  const [compact, setCompact] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const { events } = await getEventsAction(user);
        setEvents(events);
      } catch {}
    }, Math.max(15, pollSec) * 1000);
    return () => clearInterval(t);
  }, [user, pollSec]);

  const grouped = useMemo(() => {
    const g: Record<string, GithubEvent[]> = {};
    for (const e of events) {
      if (!e.created_at) continue;
      const k = new Date(e.created_at).toDateString();
      (g[k] ||= []).push(e);
    }
    return g;
  }, [events]);

  const counters = useMemo(() => {
    const c = { commits: 0, prsOpened: 0, prsMerged: 0, issuesOpened: 0, issuesClosed: 0, reviews: 0, stars: 0, forks: 0, releases: 0 };
    for (const e of events) {
      const payload = e.payload;
      if (e.type === "PushEvent") {
        // @ts-expect-error
        c.commits += payload.commits?.length || 0;
      } else if (e.type === "PullRequestEvent") {
        // @ts-expect-error
        const pr = payload.pull_request;
        const action = payload.action;
        if (pr?.merged) {
          c.prsMerged++;
        } else if (action === "opened") {
          c.prsOpened++;
        }
      } else if (e.type === "IssuesEvent") {
        const action = payload.action;
        if (action === "opened") {
          c.issuesOpened++;
        } else if (action === "closed") {
          c.issuesClosed++;
        }
      } else if (e.type === "PullRequestReviewEvent") {
        c.reviews++;
      } else if (e.type === "WatchEvent") {
        c.stars++;
      } else if (e.type === "ForkEvent") {
        c.forks++;
      } else if (e.type === "ReleaseEvent") {
        c.releases++;
      }
    }
    return c;
  }, [events]);

  const filtered = useMemo(() => (allowed.size === 0 ? events : events.filter(e => e.type && allowed.has(e.type))), [events, allowed]);

  const onRefresh = async () => {
    try {
      setLoading(true);
      const { events } = await getEventsAction(user);
      setEvents(events);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{user} — Recent GitHub Activity</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Timeline of public (or authorized) events.</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />Refresh
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
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
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
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={compact} onChange={e => setCompact(e.target.checked)} />
              Compact
            </label>
            <FilterPillBar allowed={allowed} setAllowed={setAllowed} />
          </div>
          {error && <div className="text-xs text-rose-600">{error}</div>}
        </div>
      </section>

      {/* Timeline main content */}
      <section className="mt-6">
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
                  <TimelineItem key={ev.id} ev={ev} compact={compact} />
                ))}
              </ol>
            </div>
          ))}
        </div>
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

function TimelineItem({ ev, compact }: { ev: GithubEvent; compact: boolean }) {
  const meta = eventIconAndText(ev);
  const [open, setOpen] = useState(false);
  const payload = ev.payload;
  // @ts-expect-error
  const commits = ev.type === "PushEvent" ? (payload.commits || []) : [];

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

        {ev.type === "PushEvent" && commits.length > 0 && (
          <div className="pl-6">
            <button onClick={() => setOpen(v => !v)} className="mt-1 inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
              {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {open ? "Hide" : "Show"} commits ({commits.length})
            </button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <ul className="mt-2 space-y-1 text-xs">
                    {commits.map((c: { sha: string; message: string }) => (
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