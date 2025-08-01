import type { Repository } from "@octokit/webhooks-types";
import type { RESTPatchAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";

export default function generateForumPostFirstMessage(repository: Repository): RESTPatchAPIWebhookWithTokenJSONBody & RESTPostAPIWebhookWithTokenJSONBody {
  return {
    username: "GitHub",
    // eslint-disable-next-line camelcase
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    content: [
      [
        `[\`⭐️${repository.stargazers_count}\`](<${repository.html_url}/stargazers>)`,
        `[\`🍴${repository.forks}\`](<${repository.html_url}/network/members>)`,
        repository.private ? "`🔒`" : "",
        repository.archived ? "`🗃️`" : "",
        repository.disabled ? "`🚫`" : "",
        repository.is_template ? `[\`📝\`](<${repository.html_url}/generate>)` : "",
        repository.fork ? "`🍴`" : "",
        ...repository.topics.map(topic => `[\`🏷️${topic}\`](<https://github.com/topics/${topic}>)`),
        repository.homepage ? `**[${repository.homepage.replace(/^https?:\/\//u, "").replace(/\/$/u, "")}](<${repository.homepage}>)**` : "",
      ].filter(Boolean).join(" "),
      `# [${repository.full_name}](<${repository.html_url}>)`,
      `> ${repository.description ?? "*No description provided.*"}`,
    ].join("\n"),
    // eslint-disable-next-line camelcase
    allowed_mentions: { parse: [] },
  };
}
