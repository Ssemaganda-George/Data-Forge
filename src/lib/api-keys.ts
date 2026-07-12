import { randomBytes, createHash } from "crypto";

const PREFIX = "dfk_";

export function generateApiKey() {
  const key = `${PREFIX}${randomBytes(24).toString("base64url")}`;
  return { key, prefix: key.slice(0, 10), hash: hashApiKey(key) };
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function looksLikeApiKey(value: string) {
  return value.startsWith(PREFIX);
}
