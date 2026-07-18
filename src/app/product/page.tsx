import Link from "next/link";
import {
  FileText,
  AudioLines,
  Copy,
  ShieldOff,
  Gauge,
  ClipboardList,
  Mic,
  FileSpreadsheet,
  Lock,
  Check,
  HardDrive,
  Cloud,
  Code2,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { LanguageRoutingDiagram } from "@/components/marketing/language-routing-diagram";

export const metadata = {
  title: "Product · YoDataSet",
};

const features = [
  {
    icon: FileText,
    title: "OCR and text extraction",
    description:
      "Pull clean, searchable text out of scanned PDFs, images, and screenshots automatically.",
  },
  {
    icon: AudioLines,
    title: "Audio transcription",
    description:
      "Turn voice memos and recordings into timestamped, labeled transcripts ready for training.",
  },
  {
    icon: Copy,
    title: "Deduplication",
    description:
      "Detect and remove near-duplicate files using perceptual hashing so your model never double-learns.",
  },
  {
    icon: ShieldOff,
    title: "PII redaction",
    description:
      "Scan every upload for personal data and redact or mask it before anything leaves your account.",
  },
  {
    icon: Gauge,
    title: "Confidence scoring",
    description:
      "Each output gets a 0–1 quality score, and low-confidence files are flagged for your review.",
  },
  {
    icon: ClipboardList,
    title: "The data card",
    description:
      "An auditable record of exactly what was cleaned, changed, or flagged on every file, and why — so you can trace any decision back to its source before you ship a dataset.",
  },
];

const useCases = [
  {
    icon: Mic,
    title: "Language and voice studio",
    example:
      "Upload 50 Luganda voice memos and get back a labeled speech corpus, tagged by speaker and dialect.",
    credit: "Powered by Sunbird AI for African languages",
  },
  {
    icon: FileSpreadsheet,
    title: "Business data cleaner",
    example:
      "Upload a folder of receipts and spreadsheets and get back one tidy, structured sales record.",
  },
];

const trustPoints = [
  "Encrypted in transit and at rest",
  "Never used to train third-party models",
  "Delete anytime, permanently",
  "PII scan runs automatically on upload",
];

const integrations = [
  { icon: HardDrive, label: "Google Drive", soon: true },
  { icon: Cloud, label: "Amazon S3", soon: true },
  { icon: Code2, label: "REST API", soon: false },
];

const faqs = [
  {
    question: "What file types does YoDataSet support?",
    answer: (
      <>
        PDFs, images (JPEG/PNG), CSV and Excel spreadsheets, and audio files.
        Each type is routed to the right processor automatically — OCR for
        documents, transcription for audio, and schema inference for
        spreadsheets.
      </>
    ),
  },
  {
    question: "Does my uploaded data train other models?",
    answer: (
      <>
        No. Your files are never used to train third-party models. See{" "}
        <Link href="/privacy" className="text-[#028090] hover:underline">
          our full data policy
        </Link>{" "}
        for the details.
      </>
    ),
  },
  {
    question: "How does accuracy and confidence scoring work?",
    answer: (
      <>
        Every cleaned file receives a 0–1 confidence score based on how
        certain the pipeline was about each transformation. Files that fall
        below the threshold are flagged so you can review them before export.
      </>
    ),
  },
  {
    question: "What happens when I hit the free tier limit?",
    answer: (
      <>
        You can keep reviewing and exporting what you&apos;ve already cleaned.
        To process more, upgrade on the{" "}
        <Link href="/pricing" className="text-[#028090] hover:underline">
          pricing page
        </Link>
        .
      </>
    ),
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        {/* 1. Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-[680px] text-center">
            <span className="inline-block text-xs font-medium text-[#028090] bg-[#E6F2F2] border border-[#D5E8E8] rounded-full px-3 py-1">
              Product
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
              See exactly how raw files become a training-ready dataset
            </h1>
            <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
              Upload anything, watch it get cleaned, and export a dataset your
              model can actually learn from.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-2">
              {/* Placeholder for a real dashboard screenshot. Replace the src
                  with the actual image when available. */}
              <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-[#F7FAF9] text-sm text-[#4A6461]">
                Dashboard screenshot placeholder
              </div>
              <span className="sr-only">
                Screenshot of the YoDataSet dashboard showing files processed,
                datasets ready, and review queue
              </span>
            </div>
          </div>
        </section>

        {/* 2. Feature grid */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-8">
            Everything a messy file needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-6"
                >
                  <Icon size="20" className="text-[#028090]" />
                  <h3 className="mt-3 text-sm font-semibold text-[#0B2E2C]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#4A6461] leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Use case deep-dive */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-8">
            Built for real workloads
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((u) => {
              const Icon = u.icon;
              return (
                <div
                  key={u.title}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-6"
                >
                  <Icon size="20" className="text-[#028090]" />
                  <h3 className="mt-3 text-sm font-semibold text-[#0B2E2C]">
                    {u.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#4A6461] leading-relaxed">
                    {u.example}
                  </p>
                  {u.credit && (
                    <p className="mt-2 text-[11px] text-[#8A9E9C]">
                      {u.credit}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Language routing diagram — sits directly below the use-case grid */}
          <div className="mt-8">
            <LanguageRoutingDiagram />
          </div>
        </section>

        {/* 4. Trust and data handling */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-10">
            <div className="flex items-center gap-2">
              <Lock size="20" className="text-[#028090]" />
              <h2 className="text-2xl font-semibold text-[#0B2E2C]">
                How your data is handled
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <Check
                    size="18"
                    className="mt-0.5 shrink-0 text-[#028090]"
                   
                  />
                  <span className="text-sm text-[#4A6461] leading-relaxed">
                    {point}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/privacy"
              className="mt-6 inline-block text-sm font-medium text-[#028090] hover:underline"
            >
              Read our full data policy →
            </Link>
          </div>
        </section>

        {/* 5. Comparison / positioning */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-[680px]">
            <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">
              A gap, not a grudge
            </h2>
            <p className="text-sm text-[#4A6461] leading-relaxed">
              Labeling services need a team and a budget. Developer SDKs need an
              ML engineer to run them. YoDataSet needs neither — you upload a
              file, and a clean, structured, documented dataset comes back.
            </p>
          </div>
        </section>

        {/* 6. Integrations */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-8">
            Integrations
          </h2>
          <div className="flex flex-wrap gap-3">
            {integrations.map((it) => {
              const Icon = it.icon;
              return (
                <div
                  key={it.label}
                  className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3"
                >
                  <Icon size="18" className="text-[#4A6461]" />
                  <span className="text-sm text-[#0B2E2C]">{it.label}</span>
                  {it.soon && (
                    <span className="text-xs font-medium text-[#4A6461] bg-[#F0F4F4] border border-[#E5E7EB] rounded-full px-2 py-0.5">
                      Coming soon
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-8">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faqs} />
        </section>

        {/* 8. Closing CTA */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold text-[#0B2E2C]">
              Try it on your own files
            </h2>
            <p className="mt-2 text-sm text-[#4A6461]">
              Start free — no card required.
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
                <ArrowRight size="16" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
