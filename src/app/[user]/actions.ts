// src/app/[user]/actions.ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fetchEventsWithEnv } from "./shared";

/**
 * Server Action:
 * - 外部にAPIを晒さない
 * - Cloudflareの env（KV/Secrets）にここだけで触る
 */
export async function getEventsAction(user: string) {
  const { env } = getCloudflareContext();
  return fetchEventsWithEnv(env as any, user);
}