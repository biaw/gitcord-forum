export default interface Env {
  DB: KVNamespace<`repository_config_${number}`>;
  DISCORD_WEBHOOK: string;
  FALLBACK_URL: string;
  GITHUB_WEBHOOK_SECRET: string;
  IGNORE_BOTS: "false" | "true";
  IGNORED_USERS: string;
}
