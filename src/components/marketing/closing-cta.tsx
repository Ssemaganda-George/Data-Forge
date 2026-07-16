import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="bg-white border border-[#E5E7EB] rounded-xl px-8 py-12 text-center">
        <h2 className="text-2xl font-semibold text-[#0B2E2C]">
          Ready to clean your first dataset?
        </h2>
        <p className="mt-2 text-sm text-[#4A6461]">
          Free for the first 500MB — no card required.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors text-center"
          >
            Sign up free
          </Link>
          <Link
            href="/try-free"
            className="w-full sm:w-auto text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-5 py-2.5 hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
          >
            Try it free
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
