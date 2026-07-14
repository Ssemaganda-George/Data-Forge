import type { Metadata } from "next";
import { requireServerSession } from "@/lib/auth";
import { getUsageForUser } from "@/lib/project-queries";
import { PLANS, CURRENT_PLAN_ID } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@tabler/icons-react";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const session = await requireServerSession();
  const usage = await getUsageForUser(session.user.id);
  const currentPlan = PLANS.find((p) => p.id === CURRENT_PLAN_ID)!;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage your plan and payment details.
        </p>
      </div>

      <section className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Current plan
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {currentPlan.name}
            </p>
            <p className="text-sm text-gray-500">
              {currentPlan.price} / month · {usage.monthGb} GB of{" "}
              {usage.planLimitGb} GB used
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Manage payment</Button>
            <Button variant="secondary">Cancel plan</Button>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full"
            style={{ width: `${usage.quotaPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {usage.monthGb} GB / {usage.planLimitGb} GB · Resets{" "}
          {usage.resetDate}
        </p>
      </section>

      <section>
        <p className="text-sm font-semibold text-gray-900 mb-4">All plans</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 ${
                plan.id === CURRENT_PLAN_ID
                  ? "border-brand-400 ring-1 ring-brand-400"
                  : "border-gray-100"
              }`}
            >
              {plan.id === CURRENT_PLAN_ID && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 mb-3">
                  Current plan
                </span>
              )}
              <p className="text-base font-semibold text-gray-900">
                {plan.name}
              </p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">
                {plan.price}
                <span className="text-sm font-normal text-gray-400">
                  {plan.period}
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-400">{plan.quota}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <IconCheck
                      size={13}
                      className="text-green-500 shrink-0 mt-0.5"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 min-h-[36px] flex items-center">
                {plan.id === CURRENT_PLAN_ID ? (
                  <span className="text-xs text-gray-400 text-center w-full">
                    Your current plan
                  </span>
                ) : (
                  <Button
                    variant={
                      plan.id === "enterprise" ? "secondary" : "primary"
                    }
                    className="w-full justify-center"
                  >
                    {plan.id === "enterprise"
                      ? "Contact sales"
                      : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
