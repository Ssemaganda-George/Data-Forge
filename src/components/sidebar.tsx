"use client";

import { useState } from "react";
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
  IconLogout,
  IconCreditCard,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: IconFolders },
  { href: "/dashboard/datasets", label: "Datasets", icon: IconDatabase },
  { href: "/dashboard/usage", label: "Usage", icon: IconChartBar },
  { href: "/dashboard/settings/profile", label: "Profile", icon: IconSettings },
  { href: "/dashboard/settings/api-keys", label: "API Keys", icon: IconKey },
  { href: "/dashboard/settings/integrations", label: "Integrations", icon: IconPlug },
  { href: "/dashboard/settings/billing", label: "Billing", icon: IconCreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setSigningOut(false);
      setConfirming(false);
    }
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="rounded-md" />
          <span className="text-sm font-semibold text-gray-900">YoDataSet</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 text-gray-600"
          aria-label="Open menu"
        >
          <IconMenu2 size={22} stroke={1.8} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer on mobile, static on desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="rounded-md" />
            <span className="text-sm font-semibold text-gray-900">YoDataSet</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 -mr-1 text-gray-500"
            aria-label="Close menu"
          >
            <IconX size={18} stroke={1.8} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
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

        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          {confirming ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">
                Are you sure you want to sign out?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={signingOut}
                  className="flex-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-md px-2 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex-1 text-xs font-medium text-white bg-[#028090] rounded-md px-2 py-1.5 hover:bg-[#026c78] transition-colors disabled:opacity-50"
                >
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="sidebar-link w-full"
            >
              <IconLogout size={17} stroke={1.8} />
              Sign out
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
