import type { WebhookEvent } from "@octokit/webhooks-types";
import type { RESTRateLimit } from "discord-api-types/v10";
import type Env from "../environment";
import getForumPostThreadIdForRepository from "./discordForumPost";

export default async function handleGithubEvent(data: WebhookEvent, request: Request, env: Env): Promise<Response> {
  if ("repository" in data && !(
    "sender" in data && (env.IGNORED_USERS.includes(data.sender.login) || env.IGNORE_BOTS === "true" && data.sender.type === "Bot")
  )) {
    const url = new URL(`${env.DISCORD_WEBHOOK}/github`);
    url.searchParams.set("thread_id", await getForumPostThreadIdForRepository(data.repository, env));
    url.searchParams.set("wait", "true");

    const response = await fetch(url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(await request.clone().json()),
    });

    if (response.status === 429) {
      const rateLimitData = await response.json<RESTRateLimit>();
      return new Response(`Discord's rate limit exceeded, please try again after ${rateLimitData.retry_after} seconds.`, { status: 429, headers: response.headers });
    }

    if (!response.ok) {
      const error = await response.text();
      return new Response(`Failed to send Discord webhook: ${error}`, { status: response.status, headers: response.headers });
    }

    return new Response("Discord webhook sent successfully!", { status: 200 });
  }

  return new Response("GitHub event ignored", { status: 202 });
}
