# How API keys work

YoDataSet's API routes accept two kinds of caller: a signed-in browser
(session cookie) and an external script/agent (API key). This doc covers the
API key half — where keys come from, how they're verified, and how to use
one.

## Format

A key looks like:

```
dfk_Z3JlYXQgam9iIHJlYWRpbmcgdGhpcw
```

`yodk_` is a fixed prefix (YoDataSet Key) so a key is recognizable at a
glance and so `authenticateRequest` can tell a key apart from anything else
that might show up in an `Authorization` header. The rest is 24 random bytes
from `crypto.randomBytes`, base64url-encoded.

## Generation and storage

`src/lib/api-keys.ts`:

```ts
export function generateApiKey() {
  const key = `yodk_${randomBytes(24).toString("base64url")}`;
  return { key, prefix: key.slice(0, 10), hash: hashApiKey(key) };
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}
```

When a key is created (`POST /api/keys`), the **plaintext key is returned in
that one response and never stored**. What's persisted in the `ApiKey` table
is:

| Column | Purpose |
|---|---|
| `keyHash` | SHA-256 of the full key — used to look the key up on every request |
| `keyPrefix` | First 10 chars (`yodk_` + a few bytes) — shown in the UI so a key is identifiable without revealing it |
| `name` | User-supplied label, e.g. "Kaggle notebook" |
| `lastUsedAt` | Updated on every successful authenticated request |
| `revokedAt` | Set on revoke; a non-null value makes the key permanently invalid |

This is the same pattern as GitHub/Stripe personal access tokens: if the
database leaks, the attacker gets hashes, not usable keys. There's no bcrypt
or per-key salt — a key already has 192 bits of entropy from
`randomBytes(24)`, so a straight SHA-256 lookup hash is enough (unlike a
user password, a key isn't guessable or reused across services).

## Verifying a request

Every request to `/api/upload`, `/api/projects`, `/api/jobs`, `/api/export`,
and `/api/download` goes through `authenticateRequest()` in `src/lib/auth.ts`:

```
Authorization: Bearer yodk_...
        │
        ├─ starts with "yodk_"?  ──yes──▶ hash it, look up ApiKey where
       │                                keyHash matches and revokedAt is null
       │                                  ├─ found  → authenticated as key's owner,
       │                                  │            lastUsedAt bumped (fire-and-forget)
       │                                  └─ not found → 401
       │
        └─ no Authorization header, or header isn't a yodk_ key
                  │
                  └─▶ fall back to the Supabase session cookie
                       (getServerSession()) → same 401 if that's also absent
```

Both paths resolve to the same `{ user: { id, email, name } }` shape, so
route handlers don't need to know or care which one was used — a request
authenticated by API key has exactly the same access as the key owner would
have in the dashboard, scoped by `userId` the same way everywhere else in
the codebase.

## Creating and revoking keys

Key *management* (`GET /api/keys`, `POST /api/keys`, `DELETE
/api/keys/[id]`) is session-only by design — you can't mint a new key using
an existing key. This is a deliberate limit, not an oversight: it caps the
blast radius of a leaked key (it can't be used to create more keys or lock
out the owner) and keeps key management tied to a human at the dashboard,
under **Settings → API Keys**.

Revoking sets `revokedAt` rather than deleting the row, so the key still
shows up in the list (marked "revoked") and `lastUsedAt` history isn't lost.

## Using a key

```bash
curl -H "Authorization: Bearer yodk_..." https://data-forge-jet.vercel.app/api/projects
```

```python
import requests
headers = {"Authorization": f"Bearer {API_KEY}"}
requests.get(f"{BASE_URL}/api/projects", headers=headers).json()
```

See the [README's API access & MCP section](../README.md#api-access--mcp)
for the full Kaggle/Colab and MCP client setup.

## Threat model / what's out of scope

- **No scoping** — a key can do everything the owning user can do (upload,
  read, export, download). There's no read-only or per-project key yet.
- **No rate limiting** — a leaked key can be used as fast as the API allows.
- **No expiry** — keys are valid until manually revoked.

Add these if abuse becomes a real problem; they're not needed for the
current single-tenant-per-key use case.
