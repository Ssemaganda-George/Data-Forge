import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";

export const metadata = {
  title: "Docs · YoDataSet",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-[620px] text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
              Documentation
            </h1>
            <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
              Guides, references, and examples to help you get the most out of
              YoDataSet.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Getting started",
                description:
                  "Create an account, upload your first file, and export a clean dataset in under five minutes.",
                href: "#",
              },
              {
                title: "API reference",
                description:
                  "REST endpoints for upload, download, projects, and exports. Includes request and response examples.",
                href: "#",
              },
              {
                title: "Pipeline overview",
                description:
                  "How files are routed through OCR, transcription, dedup, and schema inference.",
                href: "#",
              },
              {
                title: "Authentication",
                description:
                  "Session cookies for the dashboard, API keys for scripts and agents.",
                href: "#",
              },
              {
                title: "Integrations",
                description:
                  "Push exports directly to Kaggle or GitHub releases from the dashboard.",
                href: "#",
              },
              {
                title: "Rate limits and errors",
                description:
                  "Request limits, retry guidance, and common error codes.",
                href: "#",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="bg-white border border-[#E5E7EB] rounded-xl p-6 hover:bg-white transition-colors"
              >
                <h3 className="text-sm font-semibold text-[#0B2E2C] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#4A6461] leading-relaxed">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">
              Need help getting started?
            </h2>
            <p className="text-sm text-[#4A6461] mb-6">
              Check the developer docs for API examples, or reach out for
              onboarding support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/developers"
                className="w-full sm:w-auto text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors text-center"
              >
                View API docs
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-5 py-2.5 hover:bg-white transition-colors text-center"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
