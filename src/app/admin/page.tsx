import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { AdminPageHeader, AdminCard } from "@/components/admin/admin-ui";

export const metadata = { title: "Admin · YoDataSet" };

export default async function AdminPage() {
  await requireAdmin();

  const [totalUsers, totalInquiries, totalSubscriptions] = await Promise.all([
    db.user.count(),
    db.inquiry.count(),
    db.subscription.count(),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Inquiries", value: totalInquiries },
    { label: "Subscriptions", value: totalSubscriptions },
  ];

  const actions = [
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/inquiries", label: "View Inquiries" },
    { href: "/admin/subscriptions", label: "Manage Subscriptions" },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <AdminCard key={s.label} className="p-5">
            <p className="text-xs font-medium text-[#4A6461] uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-3xl font-semibold text-[#0B2E2C] tabular-nums">{s.value.toLocaleString()}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="p-6">
        <h2 className="text-sm font-semibold text-[#0B2E2C] mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="text-sm font-medium text-center text-white bg-brand-500 rounded-md px-4 py-2.5 hover:bg-brand-600 transition-colors"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
