import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminSignOut } from "@/components/admin-sign-out";

export const metadata = { title: "Admin · YoDataSet" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#F7FAF9]">
      <aside className="w-56 shrink-0 flex flex-col h-full bg-white border-r border-[#E5E7EB]">
        <div className="px-5 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#028090] rounded-md flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#0B2E2C]">YoDataSet</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <Link href="/admin" className="block text-sm text-[#0B2E2C] hover:bg-[#F7FAF9] rounded-md px-3 py-2 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block text-sm text-[#4A6461] hover:text-[#0B2E2C] hover:bg-[#F7FAF9] rounded-md px-3 py-2 transition-colors">
            Users
          </Link>
          <Link href="/admin/inquiries" className="block text-sm text-[#4A6461] hover:text-[#0B2E2C] hover:bg-[#F7FAF9] rounded-md px-3 py-2 transition-colors">
            Inquiries
          </Link>
          <Link href="/admin/subscriptions" className="block text-sm text-[#4A6461] hover:text-[#0B2E2C] hover:bg-[#F7FAF9] rounded-md px-3 py-2 transition-colors">
            Subscriptions
          </Link>
        </nav>

        <div className="px-3 pb-4 border-t border-[#E5E7EB] pt-3">
          <AdminSignOut />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
