import type { Repository } from "@octokit/webhooks-types";
import type { RESTError, RESTPostAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenWaitResult, Snowflake } from "discord-api-types/v10";
import type Env from "../../environment";
import generateForumPostFirstMessage from "./generateFirstMessage";

interface RepositoryDetails { firstMessageId: Snowflake; threadId: Snowflake }

export async function getRepositoryDetails(repository: Repository, env: Env): Promise<null | RepositoryDetails> {
  return env.DB.get<RepositoryDetails>(`repository_config_${repository.id}`, "json");
}

export async function getOrCreateRepositoryDetails(repository: Repository, env: Env): Promise<RepositoryDetails> {
  return await getRepositoryDetails(repository, env) ?? createForumPostForRepository(repository, env);
}

export async function createForumPostForRepository(repository: Repository, env: Env): Promise<RepositoryDetails> {
  const url = new URL(env.DISCORD_WEBHOOK);
  url.searchParams.set("wait", "true");

  const message: null | RESTError | RESTPostAPIWebhookWithTokenWaitResult = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      // eslint-disable-next-line camelcase
      thread_name: `[${repository.owner.login}] ${repository.name}`,
      ...generateForumPostFirstMessage(repository),
    } as RESTPostAPIWebhookWithTokenJSONBody),
  })
    .then(res => res.json<RESTError | RESTPostAPIWebhookWithTokenWaitResult>())
    .catch(() => null);

  if (!message || "code" in message) throw new Error(message?.message ?? "Unknown error occurred while creating forum post");

  const threadId = message.channel_id;
  const firstMessageId = message.id;

  await env.DB.put(`repository_config_${repository.id}`, JSON.stringify({ threadId, firstMessageId }));
  return { threadId, firstMessageId };
}

export async function updateForumPostForRepository(repository: Repository, env: Env, { threadId, firstMessageId }: RepositoryDetails): Promise<void> {
  const url = new URL(`${env.DISCORD_WEBHOOK}/messages/${firstMessageId}`);
  url.searchParams.set("thread_id", threadId);

  await fetch(url, {
    method: "PATCH",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(generateForumPostFirstMessage(repository)),
  });
}
