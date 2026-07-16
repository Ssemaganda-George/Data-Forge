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

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/inquiries", label: "Inquiries" },
    { href: "/admin/subscriptions", label: "Subscriptions" },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF9]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col h-screen sticky top-0 bg-white border-r border-[#E5E7EB]">
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block text-sm text-[#4A6461] hover:text-[#0B2E2C] hover:bg-[#F7FAF9] rounded-md px-3 py-2 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-[#E5E7EB] pt-3">
          <AdminSignOut />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#028090] rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#0B2E2C]">YoDataSet Admin</span>
        </div>
        <details className="relative">
          <summary className="list-none cursor-pointer rounded-md p-2 text-[#0B2E2C] hover:bg-[#F7FAF9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block text-sm text-[#4A6461] hover:text-[#0B2E2C] hover:bg-[#F7FAF9] px-4 py-2 transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="mt-1 px-4 pt-2 border-t border-[#E5E7EB]">
              <AdminSignOut />
            </div>
          </div>
        </details>
      </header>

      <div className="md:flex">
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
