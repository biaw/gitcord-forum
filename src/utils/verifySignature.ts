import type Env from "../environment";

const algorithm = { name: "HMAC", hash: "SHA-256" } as const;

export default async function verifyGithubWebhookSignature(signature: string, payload: string, env: Env): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(env.GITHUB_WEBHOOK_SECRET), algorithm, false, ["sign", "verify"]);
  const signed = await crypto.subtle.sign(algorithm.name, key, enc.encode(payload));

  const expectedSignature = array2hex(signed);
  return safeCompare(signature, expectedSignature);
}

function array2hex(arr: ArrayBuffer) {
  return [...new Uint8Array(arr)]
    .map(str => str.toString(16).padStart(2, "0"))
    .join("");
}

/* eslint-disable no-bitwise, no-param-reassign -- i stole this code and have no idea how it works but it works */
function safeCompare(expected: string, actual: string) {
  const lenExpected = expected.length;
  let result = 0;

  if (lenExpected !== actual.length) {
    actual = expected;
    result = 1;
  }

  for (let i = 0; i < lenExpected; i += 1) {
    result |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  }

  return result === 0;
}
