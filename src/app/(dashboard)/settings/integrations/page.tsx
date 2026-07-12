import type { Metadata } from "next";
import { IntegrationsManager } from "@/components/integrations-manager";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Connect ML platforms to send cleaned datasets without manual downloads.
        </p>
      </div>
      <IntegrationsManager />
    </div>
  );
}
