import type { WebhookEvent } from "@octokit/webhooks-types";
import type Env from "../environment";
import getForumPostThreadIdForRepository from "./discordForumPost";

export default async function handleGithubEvent(data: WebhookEvent, request: Request, env: Env): Promise<Response> {
  if ("repository" in data && !(
    "sender" in data && (env.IGNORED_USERS.includes(data.sender.login) || env.IGNORE_BOTS === "true" && data.sender.type === "Bot")
  )) {
    const url = new URL(`${env.DISCORD_WEBHOOK}/github`);
    url.searchParams.set("thread_id", await getForumPostThreadIdForRepository(data.repository, env));

    await fetch(url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(await request.clone().json()),
    });
  }

  return new Response(null, { status: 200 });
}
