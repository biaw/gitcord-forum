import type { WebhookEventName } from "@octokit/webhooks-types";

const discordSupportedEvents: WebhookEventName[] = [
  "commit_comment",
  "create",
  "delete",
  "fork",
  "issue_comment",
  "issues",
  "member",
  "public",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "push",
  "release",
  "watch",
  "check_run",
  "check_suite",
  "discussion",
  "discussion_comment",
];

export default discordSupportedEvents;
