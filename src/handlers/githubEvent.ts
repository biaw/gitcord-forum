import type { WebhookEvent } from "@octokit/webhooks-types";
import { type RESTPostAPIWebhookWithTokenGitHubWaitResult, RouteBases, Routes } from "discord-api-types/v10";
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
    })
      .then(res => res.json<RESTPostAPIWebhookWithTokenGitHubWaitResult>())
      .catch((error: unknown) => ({ error }));

    if ("error" in response) {
      // eslint-disable-next-line no-console
      console.error("Failed to send Discord webhook:", response.error);
      return new Response("Failed to send Discord webhook, see Worker logs for more information.", { status: 500 });
    }

    const messageUrl = new URL(RouteBases.api);
    messageUrl.pathname = Routes.channelMessage(response.channel_id, response.id);
    return new Response(`Discord webhook sent successfully - ${messageUrl.toString()}`, { status: 200 });
  }

  return new Response("GitHub event ignored", { status: 202 });
}
