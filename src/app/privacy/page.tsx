import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Privacy policy · YoDataSet",
};

const summary = [
  "We encrypt your files in transit and at rest.",
  "Your data is never used to train third-party models.",
  "You can delete your data at any time, permanently.",
  "A PII scan runs automatically on every upload.",
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
            Privacy policy
          </h1>
          <p className="mt-4 text-sm text-[#4A6461] leading-relaxed">
            This page is a placeholder. The full policy is on the way — here is
            the short version of how we handle your data in the meantime.
          </p>

          <ul className="mt-8 space-y-3">
            {summary.map((point) => (
              <li
                key={point}
                className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 text-sm text-[#4A6461]"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Link
              href="/product"
              className="text-sm font-medium text-[#028090] hover:underline"
            >
              ← Back to product
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
