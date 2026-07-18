import type { Metadata } from "next";
import { requireServerSession } from "@/lib/auth";
import { getUsageForUser } from "@/lib/project-queries";
import { formatNumber } from "@/lib/utils";
import { PLANS, CURRENT_PLAN_ID } from "@/lib/plans";
import { DEFAULT_TOP_UP_PACK } from "@/lib/pricing/plans";

export const metadata: Metadata = { title: "Usage" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsagePage() {
  const session = await requireServerSession();
  const usage = await getUsageForUser(session.user.id);
  const currentPlan = PLANS.find((p) => p.id === CURRENT_PLAN_ID)!;

  const maxGb = Math.max(...usage.months.map((m) => m.gb), 1);

  const remainingLabel = usage.creditsUnlimited
    ? "Unlimited"
    : `${formatNumber(usage.creditsRemaining ?? 0)} credits`;
  const limitLabel = usage.creditsUnlimited
    ? "Unlimited"
    : `${formatNumber(usage.creditsLimit ?? 0)} credits`;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Usage</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Credits remaining this month",
            value: remainingLabel,
          },
          {
            label: "Credits used",
            value: formatNumber(usage.creditsUsedMonth),
          },
          {
            label: "Files processed",
            value: formatNumber(usage.monthFileCount),
          },
          {
            label: "Plan",
            value: currentPlan.name,
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-900">Monthly credits</p>
          <span className="text-xs text-gray-500">
            {usage.creditsUsedMonth} / {limitLabel} used
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full"
            style={{ width: `${usage.quotaPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {usage.creditsUnlimited
            ? "Unlimited plan — no monthly cap."
            : `Resets on ${usage.resetDate}.`}
        </p>
        {!usage.creditsUnlimited && (usage.creditsRemaining ?? 0) <= 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              You&apos;ve used all your monthly credits.
            </p>
            <p className="mt-1 text-xs text-amber-800">
              Your current files finished processing. Buy a top-up pack to keep
              going, or upgrade your plan — no forced upgrade required.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/dashboard/settings/billing"
                className="inline-flex items-center text-xs font-medium text-white bg-[#028090] rounded-md px-3 py-1.5 hover:bg-[#026c78] transition-colors"
              >
                Buy {DEFAULT_TOP_UP_PACK.credits.toLocaleString()} credits · {DEFAULT_TOP_UP_PACK.price}
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center text-xs font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-3 py-1.5 hover:bg-white transition-colors"
              >
                Upgrade plan
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">
          Data processed per month
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
        <p className="mt-3 text-xs text-gray-400">
          Historical view shown in GB. Billing now runs on credits — see above.
        </p>
      </div>
    </div>
  );
}
