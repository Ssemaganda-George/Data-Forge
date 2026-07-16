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
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Current Period</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Cancel at end</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-[#F7FAF9] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0B2E2C]">{sub.user.name || sub.user.email}</td>
                <td className="px-4 py-3 text-[#4A6461]">{sub.planId}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sub.status === "ACTIVE" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs">
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} – {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs">{sub.cancelAtPeriodEnd ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-[#4A6461] text-xs">{new Date(sub.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
}
