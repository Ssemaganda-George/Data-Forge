import {
  Upload,
  Sparkles,
  Eye,
  Download,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    label: "Upload",
    description: "Drag in images, PDFs, audio, or spreadsheets, any format, any condition.",
  },
  {
    icon: Sparkles,
    label: "Clean",
    description: "AI pipeline runs OCR, transcription, deduplication, and PII redaction automatically.",
  },
  {
    icon: Eye,
    label: "Review",
    description: "Confidence-scored results, flagged items surfaced for a quick human check.",
  },
  {
    icon: Download,
    label: "Export",
    description: "Download or export a clean dataset plus a Data Card documenting exactly what changed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold text-[#0B2E2C] text-center mb-10">
        How it works
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => (
          <div
            key={step.label}
            className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-[#028090]/10 flex items-center justify-center mb-4">
              <step.icon size={20} className="text-[#028090]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B2E2C] mb-1">
              {step.label}
            </h3>
            <p className="text-xs text-[#4A6461] leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
