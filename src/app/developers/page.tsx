"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ContactForm } from "@/components/contact-form";

interface Endpoint {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
}

const endpointGroups: { label: string; endpoints: Endpoint[] }[] = [
  {
    label: "Datasets",
    endpoints: [
      { method: "POST", path: "/api/upload", description: "Upload a single file for cleaning." },
      { method: "GET", path: "/api/datasets", description: "List all datasets for the authenticated user." },
      { method: "GET", path: "/api/datasets/{id}", description: "Get a dataset with files and cleaned content (JSON or CSV)." },
      { method: "POST", path: "/api/datasets", description: "Create a new empty dataset (name required)." },
    ],
  },
  {
    label: "Projects",
    endpoints: [
      { method: "GET", path: "/api/projects", description: "List the authenticated user's projects." },
      { method: "POST", path: "/api/projects", description: "Create a new project." },
    ],
  },
  {
    label: "Jobs and export",
    endpoints: [
      { method: "GET", path: "/api/jobs", description: "Poll batch or file processing status (batchId or fileId required)." },
      { method: "POST", path: "/api/export", description: "Generate a dataset export and Data Card." },
      { method: "GET", path: "/api/download", description: "Download a cleaned dataset as a zip (fileId or batchId required)." },
    ],
  },
  {
    label: "API keys",
    endpoints: [
      { method: "GET", path: "/api/keys", description: "List API keys (dashboard session, not API key auth)." },
      { method: "POST", path: "/api/keys", description: "Create a new API key (dashboard session, not API key auth)." },
      { method: "DELETE", path: "/api/keys/{id}", description: "Revoke an API key (dashboard session, not API key auth)." },
    ],
  },
];

const pythonCode = `import requests

API_KEY = 'yodk_...'
headers = {'Authorization': f"Bearer {API_KEY}"}

datasets = requests.get('/api/datasets', headers=headers).json()
ds = datasets[0]
data = requests.get(f'/api/datasets/{ds["id"]}?format=json', headers=headers).json()
# data["files"] now contains cleanedContent you can pass to a model`;

const jsCode = `const res = await fetch('/api/datasets', {
  headers: {Authorization: "Bearer API_KEY"}
});
const datasets = await res.json();
const ds = datasets[0];
const data = await (await fetch(\`/api/datasets/\${ds.id}?format=json\`, {
  headers: {Authorization: "Bearer API_KEY"}
})).json();`;

const exampleResponse = `{
  "id": "a1b2c3d4-...",
  "name": "Luganda voice corpus",
  "description": "Cleaned speech dataset",
  "fileCount": 50,
  "totalSizeBytes": 94371840,
  "createdAt": "2026-07-18T09:12:00.000Z",
  "updatedAt": "2026-07-18T09:40:00.000Z",
  "files": [
    {
      "id": "f_8f2a...",
      "originalName": "voice_memo_03.wav",
      "fileType": "audio/wav",
      "sizeBytes": 1887436,
      "confidenceScore": 0.94,
      "flaggedForReview": false,
      "cleanedContent": "transcribed and diarized text ...",
      "createdAt": "2026-07-18T09:13:00.000Z"
    }
  ]
}`;

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  const styles: Record<Endpoint["method"], string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200",
    POST: "bg-green-50 text-green-700 border-green-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-md border shrink-0 ${styles[method]}`}
    >
      {method}
    </span>
  );
}

export default function DevelopersPage() {
  const [loading, setLoading] = useState(false);
  const [keyName, setKeyName] = useState("default");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedKey(null);
    setNeedsLogin(false);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName || "default" }),
      });

      const data = await res.json();
      if (!res.ok) {
        // 401 means there's no active session — prompt the user to log in.
        if (res.status === 401) {
          setNeedsLogin(true);
          return;
        }
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
        {/* Hero + canonical key creation */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <div className="mx-auto max-w-[620px] text-center">
            <h1 className="text-4xl font-semibold text-[#0B2E2C]">API for developers</h1>
            <p className="mt-4 text-lg text-[#4A6461]">
              Connect directly to your datasets in YoDataSet.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[620px] bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#0B2E2C] mb-2">
              Create an API key
            </h2>
            <p className="text-xs text-[#4A6461] mb-1">
              Keys start with <code className="font-mono">yodk_</code> and are
              scoped to your account only.
            </p>
            {needsLogin ? (
              <div className="mt-3 bg-[#F7FAF9] border border-[#E5E7EB] rounded-lg p-4 text-center">
                <p className="text-xs text-[#4A6461] mb-3">
                  Log in to generate an API key.
                </p>
                <Link
                  href="/login?redirectTo=/dashboard/settings/api-keys"
                  className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-4 py-2 hover:bg-[#026c78] transition-colors"
                >
                  Log in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Key name (optional)"
                  className="flex-1 text-sm rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#0B2E2C] focus:outline-none focus:border-[#028090]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="text-sm font-medium text-white bg-[#028090] rounded-md px-4 py-2 hover:bg-[#026c78] transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create API key"}
                </button>
              </form>
            )}
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            {createdKey && (
              <div className="mt-4 bg-[#F7FAF9] border border-[#E5E7EB] rounded-lg p-4">
                <p className="text-xs font-medium text-[#0B2E2C] mb-1">
                  Your new API key
                </p>
                <code className="block text-xs font-mono text-[#0B2E2C] break-all bg-white border border-[#E5E7EB] rounded px-2 py-1.5">
                  {createdKey}
                </code>
                <p className="text-[10px] text-[#4A6461] mt-2">
                  Save this key now — it won&apos;t be shown again.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick start */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#0B2E2C] mb-4">Quick start</h2>
            <div className="space-y-4 text-xs text-[#4A6461] leading-relaxed">
              <p>
                1. Create a key with the button above — it&apos;s scoped to your
                account only.
              </p>
              <p>
                2. Use the <code className="font-mono">/api/datasets</code> and{" "}
                <code className="font-mono">/api/datasets/{"{id}"}</code>{" "}
                endpoints to list datasets and fetch cleaned content.
              </p>
              <pre className="bg-[#0B2E2C] text-white rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {pythonCode}
              </pre>
              <pre className="bg-[#0B2E2C] text-white rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {jsCode}
              </pre>
            </div>
          </div>
        </section>

        {/* Example response */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#0B2E2C] mb-1">
              Example response
            </h2>
            <p className="text-xs text-[#4A6461] mb-4">
              Trimmed JSON from{" "}
              <code className="font-mono">GET /api/datasets/{"{id}"}</code> with{" "}
              <code className="font-mono">?format=json</code>.
            </p>
            <pre className="bg-[#0B2E2C] text-white rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {exampleResponse}
            </pre>
          </div>
        </section>

        {/* Endpoint reference, grouped */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#0B2E2C]">Endpoints</h2>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {endpointGroups.map((group) => (
                <div key={group.label}>
                  <div className="px-6 pt-5 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#4A6461]">
                      {group.label}
                    </span>
                  </div>
                  {group.endpoints.map((ep) => (
                    <div
                      key={ep.path}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 shrink-0">
                        <MethodBadge method={ep.method} />
                        <code className="text-xs font-mono text-[#0B2E2C]">
                          {ep.path}
                        </code>
                      </div>
                      <p className="text-xs text-[#4A6461] sm:text-right sm:ml-auto">
                        {ep.description}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Limits and errors */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-[#0B2E2C] mb-4">
              Limits and errors
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[#0B2E2C]">
                  Rate limit (planned)
                </p>
                <p className="text-xs text-[#4A6461] leading-relaxed">
                  A per-key limit of 60 requests/minute is planned but is{" "}
                  <span className="font-medium text-[#0B2E2C]">
                    not yet enforced
                  </span>
                  . Requests currently succeed without throttling.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#0B2E2C] mb-2">
                  Error codes
                </p>
                <ul className="space-y-1.5 text-xs text-[#4A6461] leading-relaxed">
                  <li>
                    <code className="font-mono text-[#0B2E2C]">401</code> —
                    missing or invalid API key (or no session).
                  </li>
                  <li>
                    <code className="font-mono text-[#0B2E2C]">400</code> — bad
                    request (e.g. missing required field, unsupported format).
                  </li>
                  <li>
                    <code className="font-mono text-[#0B2E2C]">404</code> — not
                    found.
                  </li>
                  <li>
                    <code className="font-mono text-[#0B2E2C]">500</code> —
                    processing error; safe to retry.
                  </li>
                  <li>
                    <code className="font-mono text-[#0B2E2C]">502</code> — export
                    destination (Kaggle/GitHub) failure.
                  </li>
                </ul>
                <p className="mt-2 text-xs text-[#4A6461] leading-relaxed">
                  Note: <code className="font-mono">403</code> (scope) and{" "}
                  <code className="font-mono">429</code> (rate limit) are not
                  returned by the API today.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTAs — side by side */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">
                Ready to build?
              </h2>
              <p className="text-sm text-[#4A6461] mb-6">
                Create an account and start building.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors text-center"
                >
                  Sign up free
                </Link>
                <Link
                  href="/docs"
                  className="w-full sm:w-auto text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-5 py-2.5 hover:bg-white transition-colors text-center"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">
                Need something custom?
              </h2>
              <p className="text-sm text-[#4A6461] mb-6">
                We work with research labs, NGOs, and government bodies on
                tailored data-cleaning pipelines and private deployments.
              </p>
              <button
                onClick={() => setShowContactForm(true)}
                className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors"
              >
                Talk to us
              </button>
            </div>
          </div>
        </section>

        <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
      </main>

      <Footer />
    </div>
  );
}
