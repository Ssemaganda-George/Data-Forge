"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar, AdminMobileBar } from "@/components/admin/admin-ui";

export function AdminChrome() {
  const pathname = usePathname() ?? "";
  return (
    <>
      <AdminSidebar pathname={pathname} />
      <AdminMobileBar pathname={pathname} />
    </>
  );
}
