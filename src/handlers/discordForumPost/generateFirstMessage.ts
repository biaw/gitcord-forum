import type { RESTPatchAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import type { Repository } from "@octokit/webhooks-types";

export function generateForumPostFirstMessage(repository: Repository): RESTPatchAPIWebhookWithTokenJSONBody & RESTPostAPIWebhookWithTokenJSONBody {
  return {
    username: "GitHub",
    // eslint-disable-next-line camelcase
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    content: [
      [
        `${repository.stargazers ?? 0} ⭐️`,
        `${repository.forks} 🍴`,
        `${repository.watchers} 👀`,
        repository.private ? "🔒 Private" : "",
        repository.homepage ? `**[${repository.homepage.replace(/^https?:\/\//u, "").replace(/\/$/u, "")}](<${repository.homepage}>)**` : "",
      ].filter(Boolean).join("  •  "),
      `> ${repository.description ?? "*No description provided.*"}`,
      "",
      `**[\`Go to GitHub\`](${repository.html_url})**`,
    ].join("\n"),
  };
}
