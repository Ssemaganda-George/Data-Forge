import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/secret-box";
import { pushZipToKaggle, slugifyDatasetTitle } from "@/lib/kaggle-client";
import { pushZipToGitHub, slugifyGitHubTag } from "@/lib/github-client";

export async function pushToKaggle(
  userId: string,
  zipBuffer: Buffer,
  title: string,
  slugHint?: string
) {
  const conn = await db.platformConnection.findUnique({
    where: { userId_platform: { userId, platform: "KAGGLE" } },
  });
  if (!conn) {
    throw new Error("Connect Kaggle under Settings → Integrations first");
  }

  const slug = slugHint ?? `${slugifyDatasetTitle(title)}-${Date.now().toString(36)}`;
  const result = await pushZipToKaggle(
    { username: conn.username, key: decryptSecret(conn.credential) },
    zipBuffer,
    title,
    slug
  );

  return {
    platform: "kaggle" as const,
    title,
    slug,
    url: result.url ?? `https://www.kaggle.com/datasets/${conn.username}/${slug}`,
  };
}

export async function pushToGitHub(
  userId: string,
  zipBuffer: Buffer,
  repo: string,
  title: string,
  tagHint?: string
) {
  const conn = await db.platformConnection.findUnique({
    where: { userId_platform: { userId, platform: "GITHUB" } },
  });
  if (!conn) {
    throw new Error("Connect GitHub under Settings → Integrations first");
  }

  const tag = tagHint ?? slugifyGitHubTag(title);
  const assetName = `${tag}.zip`;
  const result = await pushZipToGitHub(
    decryptSecret(conn.credential),
    repo,
    tag,
    title,
    zipBuffer,
    assetName
  );

  return {
    platform: "github" as const,
    title,
    tag,
    url: result.releaseUrl,
    assetUrl: result.assetUrl,
  };
}
