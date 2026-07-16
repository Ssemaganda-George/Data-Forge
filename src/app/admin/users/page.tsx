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
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Last Login</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#4A6461]">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F7FAF9] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0B2E2C]">{user.name || "—"}</td>
                <td className="px-4 py-3 text-[#4A6461]">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-[#E6F4F2] text-[#028090]" : "bg-gray-100 text-gray-700"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#4A6461] text-xs">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                <td className="px-4 py-3 text-[#4A6461] text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
}
