import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#F7FAF9]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo className="rounded-md" />
            <span className="text-sm font-semibold text-[#0B2E2C]">
              YoDataSet
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/product"
              className="text-sm text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            >
              Product
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/developers"
              className="text-sm text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            >
              Developers
            </Link>
            <Link
              href="/customers"
              className="text-sm text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            >
              Customers
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-[#4A6461]">
          © {new Date().getFullYear()} YoDataSet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
