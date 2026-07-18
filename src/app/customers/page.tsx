import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import {
  CaseStudyCard,
  type CaseStudyContent,
} from "@/components/marketing/case-study-card";

export const metadata = {
  title: "Customers · YoDataSet",
};

/**
 * Case study data layer.
 *
 * Only one representative scenario exists today. When a real, named customer
 * story is added, append it here with `representative: false` (or omit the
 * field) so its disclaimer is dropped, and render it with the same
 * <CaseStudyCard /> component.
 */
const caseStudies: CaseStudyContent[] = [
  {
    representative: true,
    headline: "Turning 50 field recordings into a training-ready Luganda dataset",
    persona:
      "Amina is an ML engineer at a Kampala startup building a Luganda voice assistant. She has 50 field-recorded voice memos and needs a labeled speech corpus she can actually train on.",
    paragraphs: [
      "Without YoDataSet, this is a week of manual work. Amina would transcribe each recording by hand or stitch together a general-purpose speech model that stumbles on Luganda, then translate everything for review, tag speakers, hunt for duplicates, and hope she can reconstruct what she changed when a teammate asks. Most tooling she has tried simply was not built for African languages.",
      "Instead, she creates a Language & Voice Studio project, sets the language to Luganda, and drops all 50 memos into the upload zone at once. The project already knows this is audio work, so it offers language selection up front and routes the batch accordingly.",
      "Because the files are Luganda, YoDataSet sends them to Sunbird AI, an engine built specifically for African-language speech, rather than a generic transcription model. Each memo comes back transcribed in Luganda and translated to English so Amina can review it, with the transcript and translation kept side by side.",
      "Every file gets a 0–1 confidence score, and only the uncertain ones are flagged. Out of 50 recordings, 6 fall below the threshold — background noise, a soft-spoken speaker, some overlapping voices. Amina reviews only those 6, confirms or corrects them, and leaves the confident 44 untouched. Minutes, not days.",
      "When the corpus is ready, she exports it as JSON and pushes it straight to a GitHub release for her team, with a data card documenting exactly what was transcribed, translated, flagged, and why. For a quick sanity check she also opens the Colab notebook export and loads the dataset directly into a training script.",
    ],
    closing:
      "The following week Amina is back with 200 more memos. The project, language, confidence threshold, and GitHub connection are already set up, so it is now a 3-click habit: upload, review the handful that get flagged, and push. That repeat loop — not any single feature — is what keeps her coming back.",
  },
];

export default function CustomersPage() {
  const [featured, ...rest] = caseStudies;

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-8 md:pt-24 md:pb-10">
          <div className="mx-auto max-w-[680px]">
            <span className="inline-block text-xs font-medium text-[#028090] bg-[#E6F2F2] border border-[#D5E8E8] rounded-full px-3 py-1">
              Customers
            </span>
            <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
              How teams turn messy files into datasets they can train on
            </h1>
            <p className="mt-3 text-sm text-[#4A6461] leading-relaxed">
              A closer look at the workflow, from raw upload to a labeled,
              documented dataset — with a transcription path built for African
              languages.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-12">
            <CaseStudyCard study={featured} />
          </div>

          {rest.length > 0 && (
            <div className="mt-8 space-y-8">
              {rest.map((study) => (
                <div
                  key={study.headline}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-12"
                >
                  <CaseStudyCard study={study} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
