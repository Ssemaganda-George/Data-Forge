import {
  FileText,
  Table,
  Mic,
  Image,
} from "lucide-react";

const useCases = [
  {
    icon: Mic,
    title: "Language and voice studio",
    description:
      "Transcribe audio, translate African-language speech, and build voice datasets with confidence scoring and speaker metadata.",
  },
  {
    icon: Table,
    title: "Business data cleaner",
    description:
      "Extract tables from PDFs and scanned invoices, infer schemas, remove duplicates, and export clean CSV or JSON for analytics.",
  },
];

export function UseCaseCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold text-[#0B2E2C] text-center mb-10">
        Built for your workflow
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {useCases.map((item) => (
          <div
            key={item.title}
            className="bg-white border border-[#E5E7EB] rounded-xl p-6"
          >
            <div className="w-10 h-10 rounded-lg bg-[#028090]/10 flex items-center justify-center mb-4">
              <item.icon size={20} className="text-[#028090]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B2E2C] mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-[#4A6461] leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
