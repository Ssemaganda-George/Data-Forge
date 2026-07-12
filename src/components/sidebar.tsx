"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconFolders,
  IconDatabase,
  IconChartBar,
  IconSettings,
  IconKey,
  IconPlug,
  IconBolt,
  IconLogout,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/projects", label: "Projects", icon: IconFolders },
  { href: "/datasets", label: "Datasets", icon: IconDatabase },
  { href: "/usage", label: "Usage", icon: IconChartBar },
  { href: "/settings/api-keys", label: "API Keys", icon: IconKey },
  { href: "/settings/integrations", label: "Integrations", icon: IconPlug },
  { href: "/settings/billing", label: "Settings", icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <IconBolt size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">DataForge</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "sidebar-link",
              isActive(href) && "active"
            )}
          >
            <Icon size={17} stroke={1.8} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={() => handleSignOut()}
          className="sidebar-link w-full"
        >
          <IconLogout size={17} stroke={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
