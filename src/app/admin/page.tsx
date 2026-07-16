import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Admin · YoDataSet" };

export default async function AdminPage() {
  await requireAdmin();

  const [totalUsers, totalInquiries, totalSubscriptions] = await Promise.all([
    db.user.count(),
    db.inquiry.count(),
    db.subscription.count(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0B2E2C] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <p className="text-xs font-medium text-[#4A6461] uppercase tracking-wide mb-2">Total Users</p>
          <p className="text-3xl font-semibold text-[#0B2E2C] tabular-nums">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <p className="text-xs font-medium text-[#4A6461] uppercase tracking-wide mb-2">Inquiries</p>
          <p className="text-3xl font-semibold text-[#0B2E2C] tabular-nums">{totalInquiries.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <p className="text-xs font-medium text-[#4A6461] uppercase tracking-wide mb-2">Subscriptions</p>
          <p className="text-3xl font-semibold text-[#0B2E2C] tabular-nums">{totalSubscriptions.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-[#0B2E2C] mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <Link href="/admin/users" className="text-sm font-medium text-center text-white bg-[#028090] rounded-md px-4 py-2.5 hover:bg-[#026c78] transition-colors">
            Manage Users
          </Link>
          <Link href="/admin/inquiries" className="text-sm font-medium text-center text-white bg-[#028090] rounded-md px-4 py-2.5 hover:bg-[#026c78] transition-colors">
            View Inquiries
          </Link>
          <Link href="/admin/subscriptions" className="text-sm font-medium text-center text-white bg-[#028090] rounded-md px-4 py-2.5 hover:bg-[#026c78] transition-colors">
            Manage Subscriptions
          </Link>
        </div>
      </div>
    </div>
  );
}
