// src/app/[user]/shared.ts
import { Octokit } from "@octokit/rest";
import { safeParseGithubEvents, type GithubEvent } from "@/lib/github-events-schema";

// Re-export for convenience
export type { GithubEvent } from "@/lib/github-events-schema";

export type EventsResult = {
  events: GithubEvent[];
  meta: { cache: "HIT" | "MISS" | "STALE"; pollInterval?: number; etag?: string };
};

export async function fetchEventsWithEnv(
  env: Partial<CloudflareEnv>,
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

  // Initialize Octokit client
  const octokit = new Octokit({
    auth: token,
    headers: prevEtag ? { "If-None-Match": prevEtag } : undefined,
  });

  try {
    const response = await octokit.activity.listPublicEventsForUser({
      username: user,
      per_page: 100,
    });

    // Validate response with Zod schema
    const parseResult = safeParseGithubEvents(response.data);
    if (!parseResult.success) {
      console.error("Failed to parse GitHub events:", parseResult.error);
      throw new Error("Invalid GitHub API response format");
    }

    const events = parseResult.data;
    const etag = response.headers.etag;
    const pollInterval = response.headers["x-poll-interval"] ? 
      parseInt(String(response.headers["x-poll-interval"])) : undefined;

    // Cache the new data
    if (kv) {
      if (etag) await kv.put(etagKey, etag, { expirationTtl: 60 * 30 }); // 30 minutes
      await kv.put(listKey, JSON.stringify(events), { expirationTtl: 60 * 5 }); // 5 minutes
    }

    return {
      events,
      meta: { 
        cache: "MISS", 
        pollInterval: Number.isFinite(pollInterval) ? pollInterval : undefined, 
        etag 
      },
    };
  } catch (error) {
    // Type guard for Octokit errors
    const isOctokitError = (e: unknown): e is { status: number; response?: { headers?: Record<string, string> }; message?: string } => {
      return typeof e === 'object' && e !== null && 'status' in e;
    };

    if (!isOctokitError(error)) {
      throw error;
    }

    // Handle 304 Not Modified
    if (error.status === 304) {
      if (prev) {
        const pollInterval = error.response?.headers?.["x-poll-interval"] ? 
          parseInt(error.response.headers["x-poll-interval"]) : undefined;
        
        // Validate cached data with Zod schema
        const cachedData = JSON.parse(prev);
        const parseResult = safeParseGithubEvents(cachedData);
        if (!parseResult.success) {
          console.error("Failed to parse cached GitHub events:", parseResult.error);
          // If cached data is invalid, fetch fresh data
        } else {
          return {
            events: parseResult.data,
            meta: { 
              cache: "HIT", 
              pollInterval: Number.isFinite(pollInterval) ? pollInterval : undefined, 
              etag: prevEtag ?? undefined 
            },
          };
        }
      }
      // 304 but no cache - fetch without ETag
      const freshOctokit = new Octokit({ auth: token });
      try {
        const freshResponse = await freshOctokit.activity.listPublicEventsForUser({
          username: user,
          per_page: 100,
        });
        
        // Validate fresh response with Zod schema
        const parseResult = safeParseGithubEvents(freshResponse.data);
        if (!parseResult.success) {
          console.error("Failed to parse fresh GitHub events:", parseResult.error);
          throw new Error("Invalid GitHub API response format");
        }
        
        const events = parseResult.data;
        const etag = freshResponse.headers.etag;
        const pollInterval = freshResponse.headers["x-poll-interval"] ? 
          parseInt(String(freshResponse.headers["x-poll-interval"])) : undefined;
        
        if (kv) {
          if (etag) await kv.put(etagKey, etag, { expirationTtl: 60 * 30 });
          await kv.put(listKey, JSON.stringify(events), { expirationTtl: 60 * 5 });
        }
        
        return {
          events,
          meta: { 
            cache: "MISS", 
            pollInterval: Number.isFinite(pollInterval) ? pollInterval : undefined, 
            etag 
          },
        };
      } catch (freshError) {
        throw freshError;
      }
    }

    // Handle other errors
    if (error.status === 403) {
      const remaining = error.response?.headers?.["x-ratelimit-remaining"];
      const reset = error.response?.headers?.["x-ratelimit-reset"];
      
      if (remaining === "0") {
        const resetDate = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : "soon";
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}. Set GITHUB_PAT secret for higher limits.`);
      }
      throw new Error(`GitHub API access denied (403). This might be due to rate limits. Set GITHUB_PAT secret for authentication.`);
    }
    
    if (error.status === 404) {
      throw new Error(`User "${user}" not found on GitHub`);
    }

    // If we have cached data, return it as STALE
    if (prev) {
      const cachedData = JSON.parse(prev);
      const parseResult = safeParseGithubEvents(cachedData);
      if (parseResult.success) {
        return { events: parseResult.data, meta: { cache: "STALE" } };
      }
      // If cached data is invalid, fall through to throw error
    }
    
    throw new Error(`GitHub API error: ${error.message || error.status || 'Unknown error'}`);
  }
}
