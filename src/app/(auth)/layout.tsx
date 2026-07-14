import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

// Shared layout wrapping both login and signup
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAF9] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-[#0B2E2C]">YoDataSet</h1>
          <p className="mt-1 text-sm text-[#4A6461]">
            Turn messy files into model-ready datasets.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
