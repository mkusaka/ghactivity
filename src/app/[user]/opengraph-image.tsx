// src/app/[user]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchEventsWithEnv } from "./shared";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Og({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const { env } = getCloudflareContext();
  const { events } = await fetchEventsWithEnv(env, user);
  const first = events?.[0];
  const subtitle = first?.type && first?.repo?.name
    ? `${first.type.replace(/Event$/, "")} in ${first.repo.name}`
    : "Recent GitHub Activity";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          background: "linear-gradient(180deg,#fff,#f5f7fb)", color: "#0f172a", padding: "64px",
          fontSize: 48, fontWeight: 600, justifyContent: "center"
        }}
      >
        <div>{user}</div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.7 }}>{subtitle}</div>
      </div>
    ),
    { ...size }
  );
}