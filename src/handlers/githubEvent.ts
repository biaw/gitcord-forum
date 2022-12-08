import type { WebhookEvent } from "@octokit/webhooks-types";

import { getForumPostThreadIdForRepository } from "./discordForumPost";

export default async function handleGithubEvent(data: WebhookEvent, request: Request): Promise<Response> {
  if ("repository" in data && !(
    "pusher" in data && data.pusher.name === "renovate[bot]" ||
    "ref_type" in data && data.ref_type === "branch" && data.sender.login === "renovate[bot]"
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
