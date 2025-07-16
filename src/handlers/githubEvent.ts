import type { WebhookEvent } from "@octokit/webhooks-types";
import getForumPostThreadIdForRepository from "./discordForumPost";

export default async function handleGithubEvent(data: WebhookEvent, request: Request): Promise<Response> {
  if ("repository" in data && !(
    "sender" in data && (IGNORED_USERS.includes(data.sender.login) || IGNORE_BOTS === "true" && data.sender.type === "Bot")
  )) {
    const url = new URL(`${DISCORD_WEBHOOK}/github`);
    url.searchParams.set("thread_id", await getForumPostThreadIdForRepository(data.repository));

    await fetch(url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(await request.clone().json()),
    });
  }

  return new Response(null, { status: 200 });
}
