import type { Repository } from "@octokit/webhooks-types";
import type { RESTError, RESTPostAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenWaitResult, Snowflake } from "discord-api-types/v10";
import generateForumPostFirstMessage from "./generateFirstMessage";

interface RepositoryDetails { firstMessageId: Snowflake; threadId: Snowflake }

export default async function getForumPostThreadIdForRepository(repository: Repository): Promise<Snowflake> {
  const repositoryDetailsFromDatabase = await DB.get<RepositoryDetails>(`repository_config_${repository.id}`, "json");
  if (repositoryDetailsFromDatabase) await updateForumPostForRepository(repository, repositoryDetailsFromDatabase);

  return (repositoryDetailsFromDatabase ?? await createForumPostForRepository(repository)).threadId;
}

async function createForumPostForRepository(repository: Repository): Promise<RepositoryDetails> {
  const url = new URL(DISCORD_WEBHOOK);
  url.searchParams.set("wait", "true");

  const message: null | RESTError | RESTPostAPIWebhookWithTokenWaitResult = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      // eslint-disable-next-line camelcase
      thread_name: `[${repository.owner.login}] ${repository.name}`,
      ...await generateForumPostFirstMessage(repository),
    } as RESTPostAPIWebhookWithTokenJSONBody),
  })
    .then(res => res.json<RESTError | RESTPostAPIWebhookWithTokenWaitResult>())
    .catch(() => null);

  if (!message || "code" in message) throw new Error(message?.message ?? "Unknown error occurred while creating forum post");

  const threadId = message.channel_id;
  const firstMessageId = message.id;

  await DB.put(`repository_config_${repository.id}`, JSON.stringify({ threadId, firstMessageId }));
  return { threadId, firstMessageId };
}

async function updateForumPostForRepository(repository: Repository, { threadId, firstMessageId }: RepositoryDetails): Promise<void> {
  const url = new URL(`${DISCORD_WEBHOOK}/messages/${firstMessageId}`);
  url.searchParams.set("thread_id", threadId);

  await fetch(url, {
    method: "PATCH",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(await generateForumPostFirstMessage(repository)),
  });
}
