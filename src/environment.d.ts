declare const GITHUB_WEBHOOK_SECRET: string;
declare const DISCORD_WEBHOOK: string;

declare const IGNORED_USERS: string;
declare const IGNORE_BOTS: "false" | "true";
declare const FALLBACK_URL: string;

declare const DB: KVNamespace<`repository_config_${number}`>;
