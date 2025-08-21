// src/lib/rss-generator.ts
import type { GithubEvent } from "./github-events-schema";

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
            return `• ${escapeXml(commit.message || "No message")}`;
          })
          .join("<br/>");
        description += `<br/><br/>Recent commits:<br/>${commitMessages}`;
      }
      break;
      
    case "IssuesEvent":
      if (event.payload?.action && event.payload?.issue) {
        const issue = event.payload.issue as { number?: number; title?: string };
        description = `${actor} ${event.payload.action} issue #${issue.number}: "${escapeXml(issue.title || "")}" in ${repo}`;
      }
      break;
      
    case "PullRequestEvent":
      if (event.payload?.action && event.payload?.pull_request) {
        const pr = event.payload.pull_request as { number?: number; title?: string };
        description = `${actor} ${event.payload.action} pull request #${pr.number}: "${escapeXml(pr.title || "")}" in ${repo}`;
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
        description = `${actor} ${event.payload.action || "published"} release "${escapeXml(release.name || release.tag_name || "")}" in ${repo}`;
      }
      break;
  }
  
  return description;
}

/**
 * Generate RSS feed from GitHub events
 */
export async function generateRssFeed(username: string, events: GithubEvent[]): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ghactivity.com";
  const feedUrl = `${siteUrl}/${username}/rss`;
  const githubUrl = `https://github.com/${username}`;
  
  // Get the latest event date or use current date
  const latestDate = events.length > 0 && events[0].created_at
    ? new Date(events[0].created_at)
    : new Date();
  
  // RSS header
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(username)}'s GitHub Activity</title>
    <description>Recent GitHub activity for ${escapeXml(username)}</description>
    <link>${githubUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
    <generator>GitHub Activity RSS</generator>`;
  
  // Add RSS items for each event
  for (const event of events.slice(0, 100)) { // Use all 100 events from API
    const eventDate = event.created_at ? new Date(event.created_at) : new Date();
    const eventTitle = formatEventType(event.type);
    const repoName = event.repo?.name || "unknown";
    const eventUrl = event.repo?.name 
      ? `https://github.com/${event.repo.name}`
      : githubUrl;
    
    const description = generateEventDescription(event);
    
    rss += `
    <item>
      <title>${escapeXml(eventTitle)} in ${escapeXml(repoName)}</title>
      <description><![CDATA[${description}]]></description>
      <link>${eventUrl}</link>
      <guid isPermaLink="false">${event.id}</guid>
      <pubDate>${eventDate.toUTCString()}</pubDate>
      <author>${escapeXml(username)}@github.com</author>
    </item>`;
  }
  
  // Close RSS feed
  rss += `
  </channel>
</rss>`;
  
  return rss;
}