// src/app/[user]/rss/route.ts
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchEventsWithEnv } from "../shared";
import { generateRssFeed } from "@/lib/rss-generator-feed";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ user: string }> }
) {
  try {
    const { user } = await context.params;
    const { env } = getCloudflareContext();
    
    // Parse URL query parameters for event type filtering
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type');
    const eventTypes = typeParam ? typeParam.split(',').map(t => t.trim()) : null;
    
    // Fetch user's GitHub events
    const { events, meta } = await fetchEventsWithEnv(env, user);
    
    // Filter events by type if specified
    const filteredEvents = eventTypes 
      ? events.filter(event => eventTypes.includes(event.type))
      : events;
    
    // Generate RSS feed
    const rssFeed = await generateRssFeed(user, filteredEvents);
    
    // Generate ETag for the feed content (include filter params in hash)
    const etagContent = rssFeed + (typeParam || '');
    const etag = `"${crypto.createHash('md5').update(etagContent).digest('hex')}"`;
    
    // Check If-None-Match header for conditional request
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      // Return 304 Not Modified if content hasn't changed
      return new NextResponse(null, {
        status: 304,
        headers: {
          "ETag": etag,
          "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=14400, stale-if-error=3600",
          "X-Cache-Status": meta.cache,
        },
      });
    }
    
    // Return RSS with optimized cache headers
    return new NextResponse(rssFeed, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "ETag": etag,
        "Last-Modified": new Date().toUTCString(),
        "Cache-Control": meta.cache === "HIT" 
          ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=14400, stale-if-error=3600"
          // Browser: always revalidate, CDN: 1 hour, serve stale: 4 hours
          : "public, max-age=0, s-maxage=600, stale-while-revalidate=3600, stale-if-error=600",
          // Browser: always revalidate, CDN: 10 min, serve stale: 1 hour
        "X-Cache-Status": meta.cache,
        "Vary": "Accept",
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