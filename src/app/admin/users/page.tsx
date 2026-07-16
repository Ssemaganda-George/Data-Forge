import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

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
      <h1 className="text-xl font-semibold text-[#0B2E2C] mb-6">Manage Users</h1>

      {/* Desktop / tablet: scrollable table */}
      <div className="hidden sm:block bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
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
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                <td className="px-4 py-3 text-[#4A6461] text-xs whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#4A6461]">No users yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#0B2E2C] truncate">{user.name || "—"}</p>
                <p className="text-sm text-[#4A6461] truncate">{user.email}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${user.role === "ADMIN" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                {user.role}
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-24">Last Login</dt>
                <dd className="text-[#0B2E2C] text-xs break-words">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-[#4A6461] shrink-0 w-24">Joined</dt>
                <dd className="text-[#4A6461] text-xs">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        ))}
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#4A6461]">No users yet.</p>
        )}
      </div>
    </div>
  );
}
