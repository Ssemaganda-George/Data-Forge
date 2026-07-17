import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-full max-w-6xl">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(to right, #E5E7EB 1px, transparent 1px), linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            opacity: 0.4
          }} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-[620px] text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
            Garbage in. Clean, model-ready data out.
          </h1>

          <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
            Upload raw files, images, PDFs, audio, spreadsheets and get back
            clean, structured datasets ready for machine learning.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
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
              {/* <ArrowRight size={16} /> */}
            </Link>
            <Link
              href="/#how-it-works"
              className="w-full sm:w-auto text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-5 py-2.5 hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
            >
              See how it works
              {/* <ArrowRight size={16} /> */}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
