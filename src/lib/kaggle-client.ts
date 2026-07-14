interface KaggleCredentials {
  username: string;
  key: string;
}

export async function pushZipToKaggle(
  creds: KaggleCredentials,
  zipBuffer: Buffer,
  title: string,
  slug: string
) {
  const metadata = JSON.stringify({
    title,
    id: `${creds.username}/${slug}`,
    licenses: [{ name: "CC0-1.0" }],
  });

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(zipBuffer)], { type: "application/zip" }),
    "dataset.zip"
  );
  form.append("metadata", metadata);

  const auth = Buffer.from(`${creds.username}:${creds.key}`).toString("base64");
  const res = await fetch("https://www.kaggle.com/api/v1/datasets/create/new", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kaggle API ${res.status}: ${text}`);
  }

  return res.json() as Promise<{ ref?: string; url?: string }>;
}

export function slugifyDatasetTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "yodataset-export";
}
