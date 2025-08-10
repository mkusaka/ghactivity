// src/app/[user]/shared.ts
export type EventsResult = {
  events: any[];
  meta: { cache: "HIT" | "MISS" | "STALE"; pollInterval?: number; etag?: string };
};

export async function fetchEventsWithEnv(
  env: { GITHUB_EVENTS_CACHE?: KVNamespace; GITHUB_PAT?: string },
  user: string
): Promise<EventsResult> {
  const kv = env.GITHUB_EVENTS_CACHE;
  const token = env.GITHUB_PAT;

  const listKey = `events:${user}`;
  const etagKey = `events:${user}:etag`;

  let prev: string | null = null;
  let prevEtag: string | null = null;

  if (kv) {
    [prev, prevEtag] = await Promise.all([kv.get(listKey), kv.get(etagKey)]);
  }

  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (prevEtag) headers["If-None-Match"] = prevEtag;

  const gh = await fetch(
    `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100`,
    { headers }
  );

  if (gh.status === 304) {
    if (prev) {
      const poll = parseInt(gh.headers.get("X-Poll-Interval") || "");
      return {
        events: JSON.parse(prev),
        meta: { cache: "HIT", pollInterval: Number.isFinite(poll) ? poll : undefined, etag: prevEtag ?? undefined },
      };
    }
    // 304 but no cache - fetch without ETag
    const freshHeaders: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (token) freshHeaders.Authorization = `Bearer ${token}`;
    
    const freshGh = await fetch(
      `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100`,
      { headers: freshHeaders }
    );
    
    if (!freshGh.ok) {
      throw new Error(`GitHub error ${freshGh.status}`);
    }
    
    const body = await freshGh.text();
    const etag = freshGh.headers.get("ETag") || undefined;
    const poll = parseInt(freshGh.headers.get("X-Poll-Interval") || "");
    
    if (kv) {
      if (etag) await kv.put(etagKey, etag, { expirationTtl: 60 * 30 });
      await kv.put(listKey, body, { expirationTtl: 60 * 5 });
    }
    
    return {
      events: JSON.parse(body),
      meta: { cache: "MISS", pollInterval: Number.isFinite(poll) ? poll : undefined, etag },
    };
  }

  if (!gh.ok) {
    if (prev) return { events: JSON.parse(prev), meta: { cache: "STALE" } };
    
    // Better error messages for common GitHub API errors
    if (gh.status === 403) {
      const remaining = gh.headers.get("X-RateLimit-Remaining");
      const reset = gh.headers.get("X-RateLimit-Reset");
      
      if (remaining === "0") {
        const resetDate = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : "soon";
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}. Set GITHUB_PAT secret for higher limits.`);
      }
      throw new Error(`GitHub API access denied (403). This might be due to rate limits. Set GITHUB_PAT secret for authentication.`);
    }
    
    if (gh.status === 404) {
      throw new Error(`User "${user}" not found on GitHub`);
    }
    
    throw new Error(`GitHub API error ${gh.status}`);
  }

  const body = await gh.text();
  const etag = gh.headers.get("ETag") || undefined;
  const poll = parseInt(gh.headers.get("X-Poll-Interval") || "");

  if (kv) {
    if (etag) await kv.put(etagKey, etag, { expirationTtl: 60 * 30 }); // 30分
    await kv.put(listKey, body, { expirationTtl: 60 * 5 });            // 5分
  }

  return {
    events: JSON.parse(body),
    meta: { cache: "MISS", pollInterval: Number.isFinite(poll) ? poll : undefined, etag },
  };
}
