import type { WebhookEvent } from "@octokit/webhooks-types";
import type Env from "./environment";
import handleGithubEvent from "./handlers/githubEvent";
import verifyGithubWebhookSignature from "./utils/verifySignature";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const rawGithubSignature = request.headers.get("X-Hub-Signature-256");
      if (!rawGithubSignature) return new Response(null, { status: 401, statusText: "Signature missing" });

      const [, githubSignature] = rawGithubSignature.split("=");
      if (!githubSignature) return new Response(null, { status: 401, statusText: "Signature missing" });

      const payload = await request.clone().text();
      const isVerified = await verifyGithubWebhookSignature(githubSignature, payload, env);
      if (!isVerified) return new Response(null, { status: 401 });

      const data = await request.clone().json<WebhookEvent>();
      return handleGithubEvent(data, request, env);
    }

    return Response.redirect(env.FALLBACK_URL);
  },
} satisfies ExportedHandler<Env>;
