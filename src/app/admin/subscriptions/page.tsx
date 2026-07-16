import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Subscriptions · Admin" };

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0B2E2C] mb-6">Subscriptions</h1>

      {/* Desktop / tablet: scrollable table */}
      <div className="hidden sm:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Current Period</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Cancel at end</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-[#F7FAF9] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0B2E2C] whitespace-nowrap">{sub.user.name || sub.user.email}</td>
                <td className="px-4 py-3 text-[#4A6461] whitespace-nowrap">{sub.planId}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sub.status === "ACTIVE" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} – {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{sub.cancelAtPeriodEnd ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{new Date(sub.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#4A6461]">No subscriptions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-[#0B2E2C] truncate">{sub.user.name || sub.user.email}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${sub.status === "ACTIVE" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                {sub.status}
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-28">Plan</dt>
                <dd className="text-[#0B2E2C] break-words">{sub.planId}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-28">Current Period</dt>
                <dd className="text-[#0B2E2C] text-xs break-words">
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} – {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-28">Cancel at end</dt>
                <dd className="text-[#0B2E2C]">{sub.cancelAtPeriodEnd ? "Yes" : "No"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-28">Created</dt>
                <dd className="text-[#4A6461] text-xs">{new Date(sub.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        ))}
        {subscriptions.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#4A6461]">No subscriptions yet.</p>
        )}
      </div>
    </div>
  );
}
