"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconTrash, IconKey } from "@tabler/icons-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/keys");
    if (res.ok) setKeys(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function createKey() {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "API key" }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setName("");
        load();
      }
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(id: string) {
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      {newKey && (
        <Card className="border-brand-400 bg-brand-50">
          <p className="text-sm font-medium text-gray-900">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <code className="mt-2 block text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 break-all">
            {newKey}
          </code>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setNewKey(null)}
          >
            Done
          </Button>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create a new key</CardTitle>
        </CardHeader>
        <div className="flex items-end gap-2">
          <Input
            placeholder="e.g. Kaggle notebook"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={createKey} loading={loading} disabled={loading}>
            Generate key
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your keys</CardTitle>
        </CardHeader>
        {keys.length === 0 ? (
          <p className="text-sm text-gray-400">No API keys yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {keys.map((k) => (
              <li
                key={k.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <IconKey size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {k.name}{" "}
                      {k.revokedAt && (
                        <span className="ml-1 text-xs text-red-500">
                          revoked
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {k.keyPrefix}… · created{" "}
                      {new Date(k.createdAt).toLocaleDateString()}
                      {k.lastUsedAt &&
                        ` · last used ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                {!k.revokedAt && (
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="Revoke key"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
