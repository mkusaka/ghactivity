// src/lib/rss-generator-feed.ts
import { Feed } from "feed";
import type { GithubEvent } from "./github-events-schema";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Format GitHub event type to human-readable string
 */
function formatEventType(type: string): string {
  return type
    .replace(/Event$/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

/**
 * Generate event description based on event type and payload
 */
function generateEventDescription(event: GithubEvent): string {
  const actor = event.actor?.login || "Unknown user";
  const repo = event.repo?.name || "unknown repository";
  const eventType = formatEventType(event.type);
  
  let description = `${actor} performed ${eventType} in ${repo}`;
  
  // Add specific details based on event type
  switch (event.type) {
    case "PushEvent":
      if (event.payload?.size) {
        description += ` (${event.payload.size} commit${event.payload.size > 1 ? "s" : ""})`;
      }
      if (event.payload?.commits && Array.isArray(event.payload.commits)) {
        const commits = event.payload.commits.slice(0, 3);
        const commitMessages = commits
          .map((c: unknown) => {
            const commit = c as { message?: string };
            return `• ${commit.message || "No message"}`;
          })
          .join("<br/>");
        description += `<br/><br/>Recent commits:<br/>${commitMessages}`;
      }
      break;
      
    case "IssuesEvent":
      if (event.payload?.action && event.payload?.issue) {
        const issue = event.payload.issue as { number?: number; title?: string };
        description = `${actor} ${event.payload.action} issue #${issue.number}: "${issue.title || ""}" in ${repo}`;
      }
      break;
      
    case "PullRequestEvent":
      if (event.payload?.action && event.payload?.pull_request) {
        const pr = event.payload.pull_request as { number?: number; title?: string; body?: string | null };
        description = `${actor} ${event.payload.action} pull request #${pr.number}: "${pr.title || ""}" in ${repo}`;
        if (pr.body) {
          const text = escapeHtml(pr.body);
          const short = text.length > 500 ? `${text.slice(0, 500)}…` : text;
          description += `<br/><br/>Description:<br/>${short.replaceAll("\n", "<br/>")}`;
        }
      }
      break;
      
    case "CreateEvent":
      if (event.payload?.ref_type) {
        description = `${actor} created ${event.payload.ref_type} ${event.payload.ref ? `"${event.payload.ref}"` : ""} in ${repo}`;
      }
      break;
      
    case "DeleteEvent":
      if (event.payload?.ref_type) {
        description = `${actor} deleted ${event.payload.ref_type} ${event.payload.ref ? `"${event.payload.ref}"` : ""} in ${repo}`;
      }
      break;
      
    case "WatchEvent":
      description = `${actor} starred ${repo}`;
      break;
      
    case "ForkEvent":
      if (event.payload?.forkee) {
        const forkee = event.payload.forkee as { full_name?: string };
        description = `${actor} forked ${repo} to ${forkee.full_name || ""}`;
      }
      break;
      
    case "IssueCommentEvent":
      if (event.payload?.issue && event.payload?.comment) {
        const issue = event.payload.issue as { number?: number };
        description = `${actor} commented on issue #${issue.number} in ${repo}`;
      }
      break;
      
    case "ReleaseEvent":
      if (event.payload?.release) {
        const release = event.payload.release as { name?: string; tag_name?: string };
        description = `${actor} ${event.payload.action || "published"} release "${release.name || release.tag_name || ""}" in ${repo}`;
      }
      break;
  }
  
  return description;
}

/**
 * Generate RSS feed from GitHub events using the feed package
 */
export async function generateRssFeed(username: string, events: GithubEvent[]): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ghactivity.com";
  const feedUrl = `${siteUrl}/${username}/rss`;
  const githubUrl = `https://github.com/${username}`;
  
  // Get the latest event date or use current date
  const latestDate = events.length > 0 && events[0].created_at
    ? new Date(events[0].created_at)
    : new Date();
  
  // Create feed instance
  const feed = new Feed({
    title: `${username}'s GitHub Activity`,
    description: `Recent GitHub activity for ${username}`,
    id: feedUrl,
    link: githubUrl,
    language: "en",
    image: `https://github.com/${username}.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${username}`,
    updated: latestDate,
    generator: "GitHub Activity RSS",
    feedLinks: {
      rss: feedUrl,
      json: `${siteUrl}/${username}/json`,
      atom: `${siteUrl}/${username}/atom`,
    },
    author: {
      name: username,
      link: githubUrl,
    },
    ttl: 60, // 60 minutes
  });
  
  // Add items for each event (limit to 100 most recent)
  for (const event of events.slice(0, 100)) {
    const eventDate = event.created_at ? new Date(event.created_at) : new Date();
    const eventTitle = formatEventType(event.type);
    const repoName = event.repo?.name || "unknown";
    const eventUrl = event.repo?.name 
      ? `https://github.com/${event.repo.name}`
      : githubUrl;
    
    const description = generateEventDescription(event);
    
    feed.addItem({
      title: `${eventTitle} in ${repoName}`,
      id: event.id,
      link: eventUrl,
      description: description,
      content: description,
      author: [
        {
          name: username,
          link: githubUrl,
        },
      ],
      date: eventDate,
      category: event.type ? [
        {
          name: formatEventType(event.type),
        },
      ] : undefined,
    });
  }
  
  // Return RSS 2.0 format
  return feed.rss2();
}
