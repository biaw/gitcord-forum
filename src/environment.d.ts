import type { Repository } from "@octokit/webhooks-types";

declare global {
  const GITHUB_WEBHOOK_SECRET: string;
  const DISCORD_WEBHOOK: string;

  const IGNORED_USERS: string;
  const FALLBACK_URL: string;

  const DB:
  & KVNamespace<`repository_config_${Repository["id"]}`>;
}
