import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Privacy policy · YoDataSet",
};

type Section = {
  id: string;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "who-we-are",
    title: "1. Who we are",
    body: (
      <p>
        YoDataSet (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;)
        provides a platform that cleans, structures, and prepares files for AI
        model training and business use. This policy explains what data we
        collect, how we use it, and the choices you have.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "2. What we collect",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Account data:</strong> name, email, password (hashed), and
          organization (if provided).
        </li>
        <li>
          <strong>Uploaded files:</strong> any images, PDFs, audio, or
          spreadsheets you upload for cleaning.
        </li>
        <li>
          <strong>Processing metadata:</strong> file names, sizes, processing
          timestamps, confidence scores, and cleaning actions applied.
        </li>
        <li>
          <strong>Usage data:</strong> pages visited, features used, and API
          calls made.
        </li>
        <li>
          <strong>Payment data:</strong> handled by our payment processor. We do
          not store full card numbers ourselves.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type, and device
          information.
        </li>
      </ul>
    ),
  },
  {
    id: "how-we-use",
    title: "3. How we use your data",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>To process and clean the files you upload.</li>
        <li>To operate, maintain, and improve the platform.</li>
        <li>
          To communicate with you about your account or changes to the service.
        </li>
        <li>To detect abuse, fraud, or violations of our terms.</li>
        <li>To comply with legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "your-files",
    title: "4. Your uploaded files, specifically",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Your files are processed solely to generate the cleaned dataset you
          requested.
        </li>
        <li>
          We do not use your uploaded files to train YoDataSet&rsquo;s own models
          or any third-party models, except where you explicitly opt in (for
          example, to improve accuracy for your specific use case).
        </li>
        <li>
          Files are automatically scanned for personally identifiable information
          (PII) on upload; detected PII can be redacted at your option.
        </li>
        <li>
          Some processing steps (OCR, audio transcription) are performed using
          third-party AI providers. See Section 5.
        </li>
      </ul>
    ),
  },
  {
    id: "subprocessors",
    title: "5. Third-party subprocessors",
    body: (
      <>
        <p className="mb-3">
          We use the following categories of subprocessors to operate the
          service:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Authentication, database, and file storage:</strong>{" "}
            Supabase (hosted on AWS, EU-West-1 region).
          </li>
          <li>
            <strong>Audio transcription:</strong> Groq (Whisper large-v3 model).
          </li>
          <li>
            <strong>Payment processing:</strong> a PCI-compliant payment
            processor (details shown at checkout).
          </li>
        </ul>
        <p className="mt-3">
          Each subprocessor is contractually bound to protect your data and use
          it only to provide the relevant service to us.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "6. Data retention and deletion",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Uploaded files and processed datasets are retained until you delete
          them or close your account.
        </li>
        <li>
          You can permanently delete any file, dataset, or your entire account at
          any time from Settings.
        </li>
        <li>
          Deleted data is removed from active systems within 30 days and from
          backups within 90 days.
        </li>
        <li>
          Files processed via the anonymous trial are automatically deleted after
          24 hours.
        </li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your rights",
    body: (
      <>
        <p className="mb-3">
          Depending on your location, you may have the right to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate data.</li>
          <li>Delete your data.</li>
          <li>Export your data in a portable format.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, contact us using the details in Section 12.
          We will respond within 30 days, or the timeframe required by
          applicable law.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "8. Security",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>All data is encrypted in transit (TLS) and at rest.</li>
        <li>Access to production systems is restricted and logged.</li>
        <li>
          We conduct periodic security reviews of our infrastructure and
          dependencies.
        </li>
        <li>
          No system is 100% secure; we will notify affected users of any
          confirmed data breach as required by applicable law.
        </li>
      </ul>
    ),
  },
  {
    id: "transfers",
    title: "9. International data transfers",
    body: (
      <p>
        Your data is processed primarily in the European Union (AWS EU-West-1 via
        Supabase). Where data is transferred internationally, we rely on
        appropriate safeguards such as Standard Contractual Clauses and our
        subprocessors&rsquo; adequacy commitments to protect transferred data.
      </p>
    ),
  },
  {
    id: "children",
    title: "10. Children's privacy",
    body: (
      <p>
        YoDataSet is not directed at individuals under 18. We do not knowingly
        collect data from children.
      </p>
    ),
  },
  {
    id: "changes",
    title: "11. Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. Material changes will be
        notified via email or an in-app notice before taking effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "12. Contact us",
    body: (
      <>
        <p>YoDataSet</p>
        <p>[Registered address]</p>
        <p>
          Privacy contact:{" "}
          <a
            href="mailto:privacy@yodataset.com"
            className="text-[#028090] hover:underline"
          >
            privacy@yodataset.com
          </a>
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
            Privacy policy
          </h1>
          <p className="mt-4 text-sm text-[#4A6461] leading-relaxed">
            Last updated: July 18, 2026
          </p>

          <div className="mt-8 prose-privacy">
            {sections.map((section) => (
              <section key={section.id} className="mt-8">
                <h2 className="text-lg font-semibold text-[#0B2E2C]">
                  {section.title}
                </h2>
                <div className="mt-3 text-sm text-[#4A6461] leading-relaxed space-y-3">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/product"
              className="text-sm font-medium text-[#028090] hover:underline"
            >
              ← Back to product
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
