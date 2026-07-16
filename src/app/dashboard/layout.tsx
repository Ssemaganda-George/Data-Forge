import { requireServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 py-4 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
