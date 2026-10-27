// src/og.tsx
import type { Context } from "hono";
import { ImageResponse, cache } from "@cf-wasm/og/workerd";
import { fetchEventsWithEnv } from "./lib/events";

const size = { width: 1200, height: 630 };

export async function ogHandler(c: Context<{ Bindings: CloudflareEnv }>) {
  cache.setExecutionContext(c.executionCtx);
  const user = c.req.param("user")!;
  const { events } = await fetchEventsWithEnv(c.env, user);
  const first = events?.[0];
  const subtitle = first?.type && first?.repo?.name
    ? `${first.type.replace(/Event$/, "")} in ${first.repo.name}`
    : "Recent GitHub Activity";

  return ImageResponse.async(
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
