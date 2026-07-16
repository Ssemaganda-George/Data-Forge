import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Inquiries · Admin" };

export default async function AdminInquiriesPage() {
  await requireAdmin();

  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0B2E2C] mb-6">Inquiries</h1>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Message</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {inquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-[#F7FAF9] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0B2E2C]">{inq.name}</td>
                <td className="px-4 py-3 text-[#4A6461]">{inq.email}</td>
                <td className="px-4 py-3 text-[#4A6461]">{inq.company || "—"}</td>
                <td className="px-4 py-3 text-[#4A6461] max-w-xs truncate">{inq.message}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${inq.status === "NEW" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                    {inq.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs">{new Date(inq.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#4A6461]">No inquiries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
