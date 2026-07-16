import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminCard, Badge, EmptyRow, EmptyCards } from "@/components/admin/admin-ui";

export const metadata = { title: "Inquiries · Admin" };

export default async function AdminInquiriesPage() {
  await requireAdmin();

  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader title="Inquiries" />

      <AdminCard className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Message</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {inquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-[#F7FAF9] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0B2E2C] whitespace-nowrap">{inq.name}</td>
                <td className="px-4 py-3 text-[#4A6461] whitespace-nowrap">{inq.email}</td>
                <td className="px-4 py-3 text-[#4A6461] whitespace-nowrap">{inq.company || "—"}</td>
                <td className="px-4 py-3 text-[#4A6461] max-w-xs truncate">{inq.message}</td>
                <td className="px-4 py-3"><Badge value={inq.status} /></td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{new Date(inq.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {inquiries.length === 0 && <EmptyRow colSpan={6} message="No inquiries yet." />}
          </tbody>
        </table>
      </AdminCard>

      <div className="sm:hidden space-y-3">
        {inquiries.map((inq) => (
          <AdminCard key={inq.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#0B2E2C] truncate">{inq.name}</p>
                <p className="text-sm text-[#4A6461] truncate">{inq.email}</p>
              </div>
              <Badge value={inq.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-20">Company</dt>
                <dd className="text-[#0B2E2C] break-words">{inq.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-[#4A6461]">Message</dt>
                <dd className="text-[#0B2E2C] break-words whitespace-pre-wrap">{inq.message}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-20">Received</dt>
                <dd className="text-[#0B2E2C] text-xs">{new Date(inq.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </AdminCard>
        ))}
        {inquiries.length === 0 && <EmptyCards message="No inquiries yet." />}
      </div>
    </div>
  );
}
