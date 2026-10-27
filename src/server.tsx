// src/server.tsx
import { Hono } from "hono";
import { defer, inertia } from "@hono/inertia";
import { rootView } from "./root-view";
import { fetchEventsWithEnv } from "./lib/events";
import { rssHandler } from "./rss";
import { ogHandler } from "./og";

const app = new Hono<{ Bindings: CloudflareEnv }>();

app.use(inertia({ rootView }));

const routes = app
  .get("/", (c) =>
    c.render("Home", {
      title: "ghactivity",
      description: "Explore anyone's GitHub activity timeline.",
    }),
  )
  .get("/:user/rss", rssHandler)
  .get("/:user/opengraph-image", ogHandler)
  // Used by the timeline for infinite scroll and polling
  .get("/:user/events", async (c) => {
    try {
      return c.json(await fetchEventsWithEnv(c.env, c.req.param("user"), Number(c.req.query("page") ?? 1)));
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : String(e) }, 500);
    }
  })
  .get("/:user", (c) => {
    const user = c.req.param("user");
    const typeParam = c.req.queries("type")?.join(",");
    const initialTypes = typeParam ? typeParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

    return c.render("User", {
      title: `${user} \u2014 ghactivity`,
      description: `Latest public events by ${user}`,
      user,
      initialTypes,
      initialOwnership: c.req.query("ownership"),
      // Deferred so the page (and its skeleton) shows before GitHub responds
      timeline: defer(async () => {
        try {
          const { events, meta } = await fetchEventsWithEnv(c.env, user);
          return { events, pollSec: meta.pollInterval ?? 60 };
        } catch (e) {
          console.error(e);
          return { error: e instanceof Error ? e.message : String(e) };
        }
      }),
    });
  });

export default routes;
