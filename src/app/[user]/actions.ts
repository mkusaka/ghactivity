// src/app/[user]/actions.ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchEventsWithEnv } from "./shared";

/**
 * Server Action:
 * - No external API exposure
 * - Cloudflare env (KV/Secrets) access only from here
 */
export async function getEventsAction(user: string, page: number = 1) {
  const { env } = getCloudflareContext();
  return fetchEventsWithEnv(env, user, page);
}