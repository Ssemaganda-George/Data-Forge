import type { Metadata } from "next";
import { requireServerSession } from "@/lib/auth";
import { getUsageForUser } from "@/lib/project-queries";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Usage" };

export default async function UsagePage() {
  const session = await requireServerSession();
  const usage = await getUsageForUser(session.user.id);

  const maxGb = Math.max(...usage.months.map((m) => m.gb), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Usage</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "GB processed this month",
            value: `${usage.monthGb} GB`,
          },
          {
            label: "Files processed",
            value: formatNumber(usage.monthFileCount),
          },
          {
            label: "Plan limit",
            value: `${usage.planLimitGb} GB`,
          },
          {
            label: "Plan remaining",
            value: `${usage.planRemainingGb} GB`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-5"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">
          GB processed per month
        </h2>
        <div className="flex items-end gap-3 h-40">
          {usage.months.map((m) => (
            <div
              key={m.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs text-gray-500">{m.gb}</span>
              <div
                className="w-full bg-brand-200 rounded-t-md hover:bg-brand-400 transition-colors"
                style={{ height: `${(m.gb / maxGb) * 100}%` }}
                title={`${m.gb} GB`}
              />
              <span className="text-xs text-gray-400">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">Monthly quota</p>
          <span className="text-xs text-gray-500">
            {usage.monthGb} / {usage.planLimitGb} GB
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full"
            style={{ width: `${usage.quotaPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Resets on {usage.resetDate}.
        </p>
      </div>
    </div>
  );
}
