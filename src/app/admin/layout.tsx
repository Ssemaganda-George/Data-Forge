import { requireAdmin } from "@/lib/admin-auth";
import { AdminChrome } from "@/components/admin/nav-pathname";

export const metadata = { title: "Admin · YoDataSet" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#F7FAF9] md:flex">
      <AdminChrome />

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
