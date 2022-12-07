import type { WebhookEvent } from "@octokit/webhooks-types";
import handleGithubEvent from "./handlers/githubEvent";
import verifyGithubWebhookSignature from "./utils/verifySignature";

addEventListener("fetch", event => event.respondWith(event.request.method === "POST" ? handlePost(event.request) : Response.redirect(FALLBACK_URL)));

async function handlePost(request: Request): Promise<Response> {
  const rawGithubSignature = request.headers.get("X-Hub-Signature-256");
  if (!rawGithubSignature) return new Response(null, { status: 401, statusText: "Signature missing" });

  const [, githubSignature] = rawGithubSignature.split("=");
  if (!githubSignature) return new Response(null, { status: 401, statusText: "Signature missing" });

  const payload = await request.clone().text();
  const isVerified = await verifyGithubWebhookSignature(githubSignature, payload);
  if (!isVerified) return new Response(null, { status: 401 });

  const data = await request.clone().json<WebhookEvent>();
  return handleGithubEvent(data, request);
}
