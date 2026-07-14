import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="mx-auto max-w-[620px] text-center">
        <span className="inline-block text-xs font-medium text-[#028090] bg-[#028090]/10 rounded-full px-3 py-1 mb-6">
          Built for African AI teams and small businesses
        </span>

        <h1 className="text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
          Garbage in. Clean, model-ready data out.
        </h1>

        <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
          Upload raw files — images, PDFs, audio, spreadsheets — and get back
          clean, structured datasets ready for machine learning.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors text-center"
          >
            Sign up free
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-5 py-2.5 hover:bg-white transition-colors inline-flex items-center justify-center gap-2"
          >
            See how it works
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
