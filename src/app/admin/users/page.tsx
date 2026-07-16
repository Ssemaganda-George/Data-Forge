import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminCard, Badge, EmptyRow, EmptyCards } from "@/components/admin/admin-ui";

export const metadata = { title: "Users · Admin" };

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader title="Manage Users" />

      <AdminCard className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Last Login</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461] whitespace-nowrap">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F7FAF9] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0B2E2C] whitespace-nowrap">{user.name || "—"}</td>
                <td className="px-4 py-3 text-[#4A6461] whitespace-nowrap">{user.email}</td>
                <td className="px-4 py-3"><Badge value={user.role} /></td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && <EmptyRow colSpan={5} message="No users yet." />}
          </tbody>
        </table>
      </AdminCard>

      <div className="sm:hidden space-y-3">
        {users.map((user) => (
          <AdminCard key={user.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#0B2E2C] truncate">{user.name || "—"}</p>
                <p className="text-sm text-[#4A6461] truncate">{user.email}</p>
              </div>
              <Badge value={user.role} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-24">Last Login</dt>
                <dd className="text-[#0B2E2C] text-xs break-words">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-24">Joined</dt>
                <dd className="text-[#0B2E2C] text-xs">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </AdminCard>
        ))}
        {users.length === 0 && <EmptyCards message="No users yet." />}
      </div>
    </div>
  );
}
