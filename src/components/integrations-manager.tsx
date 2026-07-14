"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function IntegrationsManager() {
  const [kaggleUsername, setKaggleUsername] = useState("");
  const [kaggleKey, setKaggleKey] = useState("");
  const [kaggleConnected, setKaggleConnected] = useState<string | null>(null);

  const [githubConnected, setGithubConnected] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/integrations/kaggle").then((r) => r.json()),
      fetch("/api/integrations/github").then((r) => r.json()),
    ])
      .then(([kaggle, github]) => {
        if (kaggle.connected && kaggle.username) setKaggleConnected(kaggle.username);
        if (github.connected && github.username) setGithubConnected(github.username);
      })
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    const githubError = params.get("github_error");
    if (githubError) {
      setError(`GitHub connect failed: ${githubError}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function saveKaggle() {
    setSaving("kaggle");
    setError(null);
    try {
      const res = await fetch("/api/integrations/kaggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: kaggleUsername, key: kaggleKey }),
      });
      const data = (await res.json()) as { error?: string; username?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setKaggleConnected(data.username ?? kaggleUsername);
      setKaggleKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  async function disconnectKaggle() {
    setSaving("kaggle");
    await fetch("/api/integrations/kaggle", { method: "DELETE" });
    setKaggleConnected(null);
    setKaggleUsername("");
    setKaggleKey("");
    setSaving(null);
  }

  async function disconnectGitHub() {
    setSaving("github");
    await fetch("/api/integrations/github", { method: "DELETE" });
    setGithubConnected(null);
    setSaving(null);
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Kaggle</h2>
            <p className="text-xs text-gray-500 mt-1">
              Push cleaned exports directly to a new Kaggle dataset from any Export menu.
            </p>
          </div>
          {kaggleConnected && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
              Connected as {kaggleConnected}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Username</span>
            <input
              type="text"
              value={kaggleUsername}
              onChange={(e) => setKaggleUsername(e.target.value)}
              placeholder={kaggleConnected ?? "kaggle-username"}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">API key</span>
            <input
              type="password"
              value={kaggleKey}
              onChange={(e) => setKaggleKey(e.target.value)}
              placeholder={kaggleConnected ? "••••••••••••" : "From kaggle.com/settings"}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="primary"
            size="sm"
            loading={saving === "kaggle"}
            disabled={!kaggleUsername || !kaggleKey}
            onClick={() => saveKaggle()}
          >
            {kaggleConnected ? "Update credentials" : "Connect Kaggle"}
          </Button>
          {kaggleConnected && (
            <Button variant="secondary" size="sm" loading={saving === "kaggle"} onClick={() => disconnectKaggle()}>
              Disconnect
            </Button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          Kaggle has no OAuth API, so this stays a pasted API key from kaggle.com/settings.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">GitHub</h2>
            <p className="text-xs text-gray-500 mt-1">Push exports as release assets to a repo you authorize.</p>
          </div>
          {githubConnected && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
              Connected as {githubConnected}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {githubConnected ? (
            <Button variant="secondary" size="sm" loading={saving === "github"} onClick={() => disconnectGitHub()}>
              Disconnect
            </Button>
          ) : (
            <a href="/api/integrations/github/authorize" className="btn-primary text-xs px-3 py-1.5 gap-1.5">
              Connect GitHub
            </a>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700">Google Colab</h2>
        <p className="text-xs text-gray-500 mt-1">
          No setup needed. Use <strong>Export → Open in Colab</strong> on the dashboard or project export page.
          The notebook is scoped to the file or batch you export from and prompts for your YoDataSet API key.
        </p>
      </div>
    </div>
  );
}
