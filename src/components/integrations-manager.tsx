"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function IntegrationsManager() {
  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [connected, setConnected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/integrations/kaggle")
      .then((r) => r.json())
      .then((d: { connected?: boolean; username?: string }) => {
        if (d.connected && d.username) setConnected(d.username);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations/kaggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, key }),
      });
      const data = (await res.json()) as { error?: string; username?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setConnected(data.username ?? username);
      setKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function disconnect() {
    setSaving(true);
    await fetch("/api/integrations/kaggle", { method: "DELETE" });
    setConnected(null);
    setUsername("");
    setKey("");
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Kaggle</h2>
            <p className="text-xs text-gray-500 mt-1">
              Push cleaned exports directly to a new Kaggle dataset from the dashboard
              <strong> Send to</strong> menu.
            </p>
          </div>
          {connected && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
              Connected as {connected}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={connected ?? "kaggle-username"}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">API key</span>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={connected ? "••••••••••••" : "From kaggle.com/settings"}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            disabled={!username || !key}
            onClick={() => save()}
          >
            {connected ? "Update credentials" : "Connect Kaggle"}
          </Button>
          {connected && (
            <Button variant="secondary" size="sm" loading={saving} onClick={() => disconnect()}>
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700">Google Colab</h2>
        <p className="text-xs text-gray-500 mt-1">
          No setup needed. Use <strong>Send to → Open in Colab</strong> on the dashboard after
          cleaning files. The notebook prompts for your DataForge API key securely.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700">GitHub</h2>
        <p className="text-xs text-gray-500 mt-1">
          Download the ZIP or copy the Python snippet, then upload to a repo or release. Native
          GitHub push is planned next.
        </p>
      </div>
    </div>
  );
}
