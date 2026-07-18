import Link from "next/link";

export interface CaseStudyContent {
  /**
   * When true, this entry is a representative scenario built from YoDataSet's
   * actual workflow — not a verified customer testimonial. The disclaimer is
   * shown only for these. Remove `representative` on a specific entry once a
   * real, named customer story replaces it.
   */
  representative?: boolean;
  headline: string;
  persona: string;
  /** Ordered narrative paragraphs (plain strings, rendered as <p>). */
  paragraphs: string[];
  /** Closing "repeat loop" paragraph, styled with slight emphasis. */
  closing: string;
}

/**
 * Long-form case study renderer. Reusable for future real, named customers —
 * pass `representative: false` (or omit it) once a verified story exists so the
 * disclaimer is not shown for that entry.
 */
export function CaseStudyCard({ study }: { study: CaseStudyContent }) {
  return (
    <article className="mx-auto max-w-[680px]">
      {study.representative && (
        <p className="text-xs text-[#8A9E9C] mb-6">
          Representative scenario, based on YoDataSet&apos;s built workflow. Not
          a verified customer testimonial.
        </p>
      )}

      <h1 className="text-3xl md:text-4xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
        {study.headline}
      </h1>

      <p className="mt-5 text-base text-[#0B2E2C] leading-relaxed font-medium">
        {study.persona}
      </p>

      <div className="mt-6 space-y-5">
        {study.paragraphs.map((para, i) => (
          <p key={i} className="text-base text-[#4A6461] leading-[1.75]">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-8 border-l-2 border-[#028090] pl-5">
        <p className="text-base text-[#0B2E2C] leading-[1.75]">
          {study.closing}
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Link
          href="/signup"
          className="text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors"
        >
          Sign up free
        </Link>
        <span className="text-xs text-[#8A9E9C]">
          Powered by Sunbird AI for African languages
        </span>
      </div>
    </article>
  );
}
