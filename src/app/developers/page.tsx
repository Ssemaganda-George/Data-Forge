"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { ContactForm } from "@/components/contact-form";

const endpoints = [
  { method: "POST", path: "/api/upload", description: "Upload a single file for cleaning." },
  { method: "GET", path: "/api/datasets", description: "List all datasets for the authenticated user." },
  { method: "GET", path: "/api/datasets/{id}", description: "Get a dataset with files and cleaned content (JSON or CSV)." },
  { method: "POST", path: "/api/datasets", description: "Create a new empty dataset." },
  { method: "GET", path: "/api/projects", description: "List the authenticated user's projects." },
  { method: "POST", path: "/api/projects", description: "Create a new project." },
  { method: "GET", path: "/api/jobs", description: "Poll batch processing status." },
  { method: "POST", path: "/api/export", description: "Generate a dataset export and Data Card." },
  { method: "GET", path: "/api/download", description: "Download a cleaned dataset as a zip." },
  { method: "GET", path: "/api/keys", description: "List API keys for the current user." },
  { method: "POST", path: "/api/keys", description: "Create a new API key." },
  { method: "DELETE", path: "/api/keys/{id}", description: "Revoke an API key." },
];

const pythonCode = `import requests

API_KEY = 'yodk_...'
BASE = 'https://data-forge-jet.vercel.app'
headers = {'Authorization': f"Bearer {API_KEY}"}

datasets = requests.get(BASE + '/api/datasets', headers=headers).json()
ds = datasets[0]
data = requests.get(BASE + '/api/datasets/' + ds['id'] + '?format=json', headers=headers).json()
# data now contains cleanedContent you can pass to a model`;

const jsCode = `const res = await fetch('/api/datasets', {
  headers: {Authorization: "Bearer {API_KEY}"}
});
const datasets = await res.json();
const ds = datasets[0];
const data = await (await fetch('/api/datasets/' + ds.id + '?format=json', {
  headers: {Authorization: "Bearer {API_KEY}"}
})).json();`;

export default function DevelopersPage() {
  const [loading, setLoading] = useState(false);
  const [keyName, setKeyName] = useState("default");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedKey(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName || "default" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create key");
        return;
      }

      setCreatedKey(data.key);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <div className="mx-auto max-w-[620px] text-center">
            <h1 className="text-4xl font-semibold text-[#0B2E2C]">API for developers</h1>
            <p className="mt-4 text-lg text-[#4A6461]">Connect directly to your datasets in YoDataSet.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#0B2E2C] mb-2">Generate an API key</h2>
            <p className="text-xs text-[#4A6461] mb-4">Keys start with yodk_.</p>
            <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Key name (optional)"
                className="flex-1 text-sm rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#0B2E2C] focus:outline-none focus:border-[#028090]"
              />
              <button type="submit" disabled={loading} className="text-sm font-medium text-white bg-[#028090] rounded-md px-4 py-2 hover:bg-[#026c78] transition-colors disabled:opacity-60">
                {loading ? "Creating..." : "Create API key"}
              </button>
            </form>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            {createdKey && (
              <div className="mt-4 bg-[#F7FAF9] border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-xs font-medium text-[#0B2E2C] mb-1">Your new API key</p>
                <code className="block text-xs font-mono text-[#0B2E2C] break-all bg-white border border-[#E5E7EB] rounded px-2 py-1.5">{createdKey}</code>
                <p className="text-[10px] text-[#4A6461] mt-2">Save this key now.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#0B2E2C] mb-4">Quick start</h2>
            <div className="space-y-4 text-xs text-[#4A6461] leading-relaxed">
              <p>Create an API key under Settings &rarr; API Keys in the dashboard.</p>
              <p>Use the /api/datasets and /api/datasets/{`{id}`} endpoints to list datasets and fetch cleaned content.</p>
              <pre className="bg-[#0B2E2C] text-white rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">{pythonCode}</pre>
              <pre className="bg-[#0B2E2C] text-white rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">{jsCode}</pre>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#0B2E2C]">Endpoints</h2>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {endpoints.map((ep) => (
                <div key={ep.path} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                      ep.method === "GET" ? "text-[#028090] border-[#028090]/20 bg-[#028090]/10" : ep.method === "POST" ? "text-[#00A896] border-[#00A896]/20 bg-[#00A896]/10" : "text-red-700 border-red-200 bg-red-50"
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-xs font-mono text-[#0B2E2C]">{ep.path}</code>
                  </div>
                  <p className="text-xs text-[#4A6461]">{ep.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">Ready to build?</h2>
            <p className="text-sm text-[#4A6461] mb-6">Create an account and start building.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="w-full sm:w-auto text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors text-center">Sign up free</Link>
              <Link href="/docs" className="w-full sm:w-auto text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-5 py-2.5 hover:bg-white transition-colors text-center">Read the docs</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">Need something custom?</h2>
            <p className="text-sm text-[#4A6461] mb-6">We work with research labs, NGOs, and government bodies on tailored data-cleaning pipelines and private deployments.</p>
            <button onClick={() => setShowContactForm(true)} className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors">Talk to us</button>
          </div>
        </section>

        <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
      </main>
    </div>
  );
}
