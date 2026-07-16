import Link from "next/link";
import { AdminSignOut } from "@/components/admin-sign-out";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {ADMIN_NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              "block text-sm rounded-md px-3 py-2 transition-colors " +
              (active
                ? "bg-brand-50 text-brand-500 font-medium"
                : "text-[#4A6461] hover:text-[#0B2E2C] hover:bg-[#F7FAF9]")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0 bg-white border-r border-[#E5E7EB]">
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#0B2E2C]">YoDataSet</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NavLinks pathname={pathname} />
      </nav>

      <div className="px-3 pb-4 border-t border-[#E5E7EB] pt-3">
        <AdminSignOut />
      </div>
    </aside>
  );
}

export function AdminMobileBar({ pathname }: { pathname: string }) {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between bg-white border-b border-[#E5E7EB] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center">
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
          <NavLinks pathname={pathname} />
          <div className="mt-1 px-4 pt-2 border-t border-[#E5E7EB]">
            <AdminSignOut />
          </div>
        </div>
      </details>
    </header>
  );
}

export function AdminPageHeader({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-[#0B2E2C]">{title}</h1>
    </div>
  );
}

export function AdminCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={"bg-white border border-[#E5E7EB] rounded-xl " + className}>
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  ADMIN: "bg-brand-50 text-brand-500",
  ACTIVE: "bg-brand-50 text-brand-500",
  NEW: "bg-brand-50 text-brand-500",
};

export function Badge({ value }: { value: string }) {
  const tone = STATUS_STYLES[value] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tone}`}>
      {value}
    </span>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-[#4A6461]">
        {message}
      </td>
    </tr>
  );
}

export function EmptyCards({ message }: { message: string }) {
  return <p className="px-4 py-10 text-center text-sm text-[#4A6461]">{message}</p>;
}
