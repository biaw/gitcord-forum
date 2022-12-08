[![Deploy](https://img.shields.io/github/workflow/status/biaw/gitcord-forum/Build%20and%20publish?label=build)](https://github.com/biaw/gitcord-forum/actions/workflows/build-and-publish.yml)
[![Linting](https://img.shields.io/github/workflow/status/biaw/gitcord-forum/Linting?label=quality)](https://github.com/biaw/gitcord-forum/actions/workflows/linting.yml)
[![Analysis and Scans](https://img.shields.io/github/workflow/status/biaw/gitcord-forum/Analysis%20and%20Scans?label=scan)](https://github.com/biaw/gitcord-forum/actions/workflows/analysis-and-scans.yml)
[![DeepScan grade](https://deepscan.io/api/teams/16173/projects/23243/branches/698660/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16173&pid=23243&bid=698660)
[![GitHub Issues](https://img.shields.io/github/issues-raw/biaw/gitcord-forum.svg)](https://github.com/biaw/gitcord-forum/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/biaw/gitcord-forum.svg)](https://github.com/biaw/gitcord-forum/pulls)

# Gitcord Forum [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/biaw/gitcord-forum)

A middleware designed to sort your repositories into forum posts.

<details>
  <summary>Screenshot</summary>
  
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/10573728/206237592-9104b964-74d6-4a29-a2ab-f36dc400481c.png">
    <img alt="Image of the forum channel on Discord" src="https://user-images.githubusercontent.com/10573728/206237630-b76efa8e-68a2-498d-9463-edfe3d75f58a.png">
  </picture>
</details>

## Usage examples

* If you have a lot of projects on your GitHub and you don't want to clog up one channel with all of it but you also don't want to create too many channels for all your repository feeds.

## Setting up with Workers

1. [Deploy with Workers](https://deploy.workers.cloudflare.com/?url=https://github.com/biaw/gitcord-forum)
2. Insert the environment variables listed in the [`wrangler.toml`](https://github.com/biaw/gitcord-forum/blob/main/wrangler.toml) file. You can either use the `wrangler` command, or do it through the worker dashboard.
3. Add your new worker URL (`https://gitcord-forum.WORKER_SUBDOMAIN.workers.dev/`) as a webhook in your GitHub repository settings. Make sure to set content type to àpplication/json` and also match the secret you set in the environment variables.

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
