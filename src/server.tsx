// src/server.tsx
import { Hono } from "hono";
import { inertia } from "@hono/inertia";
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
  .get("/:user", async (c) => {
    const user = c.req.param("user");
    const typeParam = c.req.queries("type")?.join(",");
    const initialTypes = typeParam ? typeParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const ownershipParam = c.req.query("ownership");

    try {
      const { events, meta } = await fetchEventsWithEnv(c.env, user);
      const first = events[0];
      return c.render("User", {
        title: `${user} — ghactivity`,
        description:
          first?.type && first?.repo?.name
            ? `Latest: ${first.type.replace(/Event$/, "")} in ${first.repo.name}`
            : `Latest public events by ${user}`,
        user,
        events,
        initialTypes,
        initialOwnership: ownershipParam,
        pollSec: meta.pollInterval ?? 60,
      });
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : String(e);
      c.status(message.includes("not found") ? 404 : 500);
      return c.render("UserError", { title: `${user} — ghactivity`, description: message, user, message });
    }
  });

export default routes;
