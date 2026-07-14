interface GitHubRelease {
  id: number;
  html_url: string;
  upload_url: string;
}

function parseRepo(repo: string) {
  const [owner, name] = repo.trim().split("/");
  if (!owner || !name) {
    throw new Error('Repo must be "owner/name" (e.g. myorg/datasets)');
  }
  return { owner, name };
}

async function githubFetch<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function getOrCreateRelease(
  token: string,
  owner: string,
  repo: string,
  tagName: string,
  title: string
): Promise<GitHubRelease> {
  const existing = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tagName)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (existing.ok) {
    return existing.json() as Promise<GitHubRelease>;
  }

  if (existing.status !== 404) {
    const text = await existing.text();
    throw new Error(`GitHub API ${existing.status}: ${text}`);
  }

  return githubFetch<GitHubRelease>(token, `/repos/${owner}/${repo}/releases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tag_name: tagName,
      name: title,
      body: "Exported from YoDataSet",
      draft: false,
      prerelease: false,
    }),
  });
}

export async function pushZipToGitHub(
  token: string,
  repo: string,
  tagName: string,
  title: string,
  zipBuffer: Buffer,
  assetName: string
) {
  const { owner, name } = parseRepo(repo);
  const release = await getOrCreateRelease(token, owner, name, tagName, title);

  const uploadUrl = release.upload_url.replace("{?name,label}", "");
  const res = await fetch(`${uploadUrl}?name=${encodeURIComponent(assetName)}`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: new Uint8Array(zipBuffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub upload ${res.status}: ${text}`);
  }

  const asset = (await res.json()) as { browser_download_url?: string };
  return {
    releaseUrl: release.html_url,
    assetUrl: asset.browser_download_url ?? release.html_url,
  };
}

export function slugifyGitHubTag(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "yodataset-export"}-${Date.now().toString(36)}`;
}
