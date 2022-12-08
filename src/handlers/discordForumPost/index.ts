import type { RESTError, RESTPatchAPIWebhookWithTokenMessageJSONBody, RESTPostAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenWaitResult, Snowflake } from "discord-api-types/v10";
import type { Repository } from "@octokit/webhooks-types";
import { generateForumPostFirstMessage } from "./generateFirstMessage";

interface RepositoryDetails { threadId: Snowflake; firstMessageId: Snowflake }

export async function getForumPostThreadIdForRepository(repository: Repository): Promise<Snowflake> {
  const repositoryDetailsFromDatabase = await DB.get<RepositoryDetails>(`repository_config_${repository.id}`, "json");
  if (repositoryDetailsFromDatabase) await updateForumPostForRepository(repository, repositoryDetailsFromDatabase);

  return (repositoryDetailsFromDatabase ?? await createForumPostForRepository(repository)).threadId;
}

async function createForumPostForRepository(repository: Repository): Promise<RepositoryDetails> {
  const url = new URL(DISCORD_WEBHOOK);
  url.searchParams.set("wait", "true");

  const message: RESTError | RESTPostAPIWebhookWithTokenWaitResult = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      // eslint-disable-next-line camelcase
      thread_name: `[${repository.owner.login}] ${repository.name}`,
      ...await generateForumPostFirstMessage(repository),
    } as RESTPostAPIWebhookWithTokenJSONBody),
  }).then(res => res.json());

  if ("code" in message) throw new Error(String(message));

  const threadId = message.channel_id;
  const firstMessageId = message.id;

  await DB.put(`repository_config_${repository.id}`, JSON.stringify({ threadId, firstMessageId }));
  return { threadId, firstMessageId };
}

async function updateForumPostForRepository(repository: Repository, { threadId, firstMessageId }: RepositoryDetails): Promise<void> {
  const url = new URL(`${DISCORD_WEBHOOK}/messages/${firstMessageId}`);
  url.searchParams.set("thread_id", threadId);

  const message: RESTError | RESTPatchAPIWebhookWithTokenMessageJSONBody = await fetch(url, {
    method: "PATCH",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(await generateForumPostFirstMessage(repository)),
  }).then(res => res.json());

  if ("code" in message) throw new Error(String(message));
}
