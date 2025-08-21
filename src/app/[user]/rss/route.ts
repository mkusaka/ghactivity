// src/app/[user]/rss/route.ts
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchEventsWithEnv } from "../shared";
import { generateRssFeed } from "@/lib/rss-generator";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ user: string }> }
) {
  try {
    const { user } = await context.params;
    const { env } = getCloudflareContext();
    
    // Fetch user's GitHub events
    const { events, meta } = await fetchEventsWithEnv(env, user);
    
    // Generate RSS feed
    const rssFeed = await generateRssFeed(user, events);
    
    // Return RSS with appropriate headers
    return new NextResponse(rssFeed, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": meta.cache === "HIT" 
          ? "public, max-age=300, s-maxage=300, stale-while-revalidate=60"
          : "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
        "X-Cache-Status": meta.cache,
      },
    });
  } catch (error) {
    // Handle errors appropriately
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Generate error RSS feed
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Error - GitHub Activity Feed</title>
    <description>${errorMessage}</description>
    <link>https://github.com</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <item>
      <title>Error loading feed</title>
      <description>${errorMessage}</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;
    
    return new NextResponse(errorFeed, {
      status: 500,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}