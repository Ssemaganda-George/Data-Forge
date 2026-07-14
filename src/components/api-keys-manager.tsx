"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconTrash, IconKey, IconCheck, IconCopy } from "@tabler/icons-react";

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
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
        body: JSON.stringify({ name: keyName || "API key" }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setKeyName("");
        setShowNamePrompt(false);
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

  async function copyKey() {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      {newKey && (
        <Card className="border-[#028090] bg-[#E6F4F2]">
          <p className="text-sm font-medium text-[#0B2E2C]">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 break-all">
              {newKey}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyKey}
              className="shrink-0"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={() => setNewKey(null)}
          >
            I&apos;ve saved my key
          </Button>
        </Card>
      )}

      {showNamePrompt ? (
        <Card className="border-[#028090]">
          <CardHeader>
            <CardTitle>Name your API key</CardTitle>
          </CardHeader>
          <p className="text-xs text-[#4A6461] mb-3">
            Give this key a label so you know where it&apos;s used, e.g.
            &quot;Kaggle notebook&quot; or &quot;Colab script&quot;.
          </p>
          <div className="flex items-end gap-2">
            <Input
              placeholder="e.g. Kaggle notebook"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button onClick={createKey} loading={loading} disabled={loading}>
              Generate key
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNamePrompt(false);
                setKeyName("");
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create a new key</CardTitle>
          </CardHeader>
          <Button onClick={() => setShowNamePrompt(true)}>
            <IconKey size={16} />
            Generate key
          </Button>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your keys</CardTitle>
        </CardHeader>
        {keys.length === 0 ? (
          <p className="text-sm text-[#4A6461]">No API keys yet.</p>
        ) : (
          <ul className="divide-y divide-[#E5E7EB]">
            {keys.map((k) => (
              <li
                key={k.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <IconKey size={16} className="text-[#4A6461]" />
                  <div>
                    <p className="text-sm font-medium text-[#0B2E2C]">
                      {k.name}{" "}
                      {k.revokedAt && (
                        <span className="ml-1 text-xs text-red-600">
                          revoked
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#4A6461]">
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
                    className="text-[#4A6461] hover:text-red-600"
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
