import type { Issue, Repository } from "@octokit/webhooks-types";
import type { RESTPatchAPIWebhookWithTokenJSONBody, RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";

export default async function generateForumPostFirstMessage(repository: Repository): Promise<RESTPatchAPIWebhookWithTokenJSONBody & RESTPostAPIWebhookWithTokenJSONBody> {
  const [issues, pulls] = await fetch(`${repository.url}/issues`, { headers: { "User-Agent": "biaw/gitcord-forum (promise.solutions)" } })
    .then(res => res.json<Issue[]>())
    .then(unknowns => [
      unknowns.filter(issue => !issue.pull_request && issue.title !== "Dependency Dashboard"),
      unknowns.filter(issue => issue.pull_request),
    ] as const)
    .catch(() => [[], []] as const);

  const amountOfIssues = Math.min(Math.max(4 - pulls.length, 0) + 4, issues.length);
  const amountOfPulls = Math.min(Math.max(4 - issues.length, 0) + 4, pulls.length);

  return {
    username: "GitHub",
    // eslint-disable-next-line camelcase
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    content: [
      [
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
      issues.length ?
        [
          `**${issues.length === 1 ? "1 open issue" : `${issues.length} open issues`}:** ${issues.length === amountOfIssues ? "" : `*(showing ${amountOfIssues})*`}`,
          ...issues.slice(0, amountOfIssues).map(issue => `• [\`#${issue.number}\` ${issue.title}](<${issue.html_url}>), created <t:${Math.floor(new Date(issue.created_at).getTime() / 1000)}:R> by @${issue.user.login}`),
        ].join("\n") :
        "",
      pulls.length ?
        [
          `**${pulls.length === 1 ? "1 open pull request" : `${pulls.length} open pull requests`}:** ${pulls.length === amountOfPulls ? "" : `*(showing ${amountOfPulls})*`}`,
          ...pulls.slice(0, amountOfPulls).map(pull => `• [\`#${pull.number}\` ${pull.title}](<${pull.html_url}>), created <t:${Math.floor(new Date(pull.created_at).getTime() / 1000)}:R> by @${pull.user.login}`),
        ].join("\n") :
        "",
    ].filter(Boolean).join("\n\n"),
    // eslint-disable-next-line camelcase
    allowed_mentions: { parse: [] },
  };
}
