import type { Metadata } from "next";
import { ApiKeysManager } from "@/components/api-keys-manager";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">API Keys</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Use API keys to pull and push datasets from scripts, notebooks
          (Kaggle, Colab), or an MCP client. Send them as{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            Authorization: Bearer &lt;key&gt;
          </code>
          .
        </p>
      </div>
      <ApiKeysManager />
    </div>
  );
}
