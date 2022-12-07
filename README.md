[![Deploy](https://img.shields.io/github/workflow/status/biaw/gitcord-forum/Build%20and%20publish?label=build)](https://github.com/biaw/gitcord-forum/actions/workflows/build-and-publish.yml)
[![Linting](https://img.shields.io/github/workflow/status/biaw/gitcord-forum/Linting?label=quality)](https://github.com/biaw/gitcord-forum/actions/workflows/linting.yml)
[![Analysis and Scans](https://img.shields.io/github/workflow/status/biaw/gitcord-forum/Analysis%20and%20Scans?label=scan)](https://github.com/biaw/gitcord-forum/actions/workflows/analysis-and-scans.yml)
<!-- deepscan -->
[![GitHub Issues](https://img.shields.io/github/issues-raw/biaw/gitcord-forum.svg)](https://github.com/biaw/gitcord-forum/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/biaw/gitcord-forum.svg)](https://github.com/biaw/gitcord-forum/pulls)

# Gitcord Forum [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/biaw/gitcord-forum)

A middleware designed to sort your repositories into forum posts.

<details>
  <summary>Screenshots</summary>

  <!-- insert screenshots -->
</details>

## Usage examples

* If you have a lot of projects on your GitHub and you don't want to clog up one channel with all of it but you also don't want to create too many channels for all your repository feeds.

## Setting up with Workers

1. [Deploy with Workers](https://deploy.workers.cloudflare.com/?url=https://github.com/biaw/gitcord-forum)
2. Insert the environment variables listed in the [`wrangler.toml`](https://github.com/biaw/gitcord-forum/blob/main/wrangler.toml) file. You can either use the `wrangler` command, or do it through the worker dashboard.
3. Add your new worker URL (`https://github-discord-middleware.WORKER_SUBDOMAIN.workers.dev/`) as a webhook in your GitHub repository settings. Make sure to set content type to àpplication/json` and also match the secret you set in the environment variables.

## How the middleware works

```mermaid
sequenceDiagram
    autonumber
    participant G as GitHub
    participant W as Cloudflare Worker & Storage
    participant D as Discord Webhook

    activate G
    G->>W: Send a Webhook event
    activate W

    alt signature header is not valid
        W->>G: 401 Unauthorized
    end

    alt event is not a repository event
        W->>G: 200 OK
    end

    W->>W: Find thread ID for repository

    alt no forum thread exists
        W->>D: Create a new forum thread and send first message
        D->>W: Return message data with thread ID
        W->>W: Save thread ID and message ID
    else forum thread exists
        W->>D: Update first forum message with new information
    end

    W->>D: Forward GitHub event to new or existing forum thread
    W->>G: 200 OK
```
