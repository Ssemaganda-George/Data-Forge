import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";

export const metadata = {
  title: "Product · YoDataSet",
};

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-[620px] text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
              Built for teams that need clean data, fast
            </h1>
            <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
              YoDataSet turns raw, unstructured files into structured, model-ready datasets
              through a typed cleaning pipeline — no labeling team, no SDK, no code required.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Drag-and-drop upload",
                description:
                  "Drop any file directly onto the dashboard. It is cleaned and annotated in seconds, with per-file progress and confidence scores.",
              },
              {
                title: "Multi-format support",
                description:
                  "Images, PDFs, audio/video, CSV/XLSX spreadsheets — all routed automatically to the correct processor.",
              },
              {
                title: "Per-file cleaning pipeline",
                description:
                  "OCR, transcription, perceptual dedup, schema inference, PII redaction, and language detection — each file type gets the right treatment.",
              },
              {
                title: "Confidence scoring",
                description:
                  "Every output file receives a 0–1 quality score. Low-confidence files are flagged for manual review before export.",
              },
              {
                title: "Review dashboard",
                description:
                  "Accept, reject, or edit flagged files in a simple table. Changes are logged with full provenance.",
              },
              {
                title: "Dataset export",
                description:
                  "Download as CSV, JSON, Parquet, or COCO. Each export includes an auto-generated Data Card documenting exactly what changed.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-[#E5E7EB] rounded-xl p-6"
              >
                <h3 className="text-sm font-semibold text-[#0B2E2C] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#4A6461] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">
              Ready to clean your first dataset?
            </h2>
            <p className="text-sm text-[#4A6461] mb-6">
              Free for the first 500MB — no card required.
            </p>
            <Link
              href="/signup"
              className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
