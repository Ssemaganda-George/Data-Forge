import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usage" };

const MONTHS = [
  { month: "Feb", gb: 12 },
  { month: "Mar", gb: 18 },
  { month: "Apr", gb: 22 },
  { month: "May", gb: 30 },
  { month: "Jun", gb: 27 },
  { month: "Jul", gb: 38 },
];

const maxGb = Math.max(...MONTHS.map((m) => m.gb));

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Usage</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "GB processed this month", value: "38 GB" },
          { label: "Files processed", value: "12,480" },
          { label: "Plan limit", value: "100 GB" },
          { label: "Plan remaining", value: "62 GB" },
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

      {/* Bar chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">
          GB processed per month
        </h2>
        <div className="flex items-end gap-3 h-40">
          {MONTHS.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
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

      {/* Quota bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">Monthly quota</p>
          <span className="text-xs text-gray-500">38 / 100 GB</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full"
            style={{ width: "38%" }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Resets on 1 August 2026.
        </p>
      </div>
    </div>
  );
}
