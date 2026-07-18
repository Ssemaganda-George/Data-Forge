import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Terms & Conditions · YoDataSet",
};

type Section = {
  id: string;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of these terms",
    body: (
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to
        and use of YoDataSet (the &ldquo;Service&rdquo;), a platform that cleans,
        structures, and prepares files for AI model training and business use. By
        creating an account, signing in, or otherwise using the Service, you
        agree to these Terms. If you do not agree, do not use the Service.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "2. Your account",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>You must be at least 18 years old to use the Service.</li>
        <li>
          You are responsible for the accuracy of your account information and
          for keeping your credentials secure.
        </li>
        <li>
          You are responsible for all activity that occurs under your account.
        </li>
        <li>
          Notify us promptly if you suspect unauthorized use of your account.
        </li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable use",
    body: (
      <>
        <p className="mb-3">You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Upload content you do not have the legal right to process, or that
            infringes the rights of others.
          </li>
          <li>
            Use the Service to process unlawful, harmful, or abusive material.
          </li>
          <li>
            Attempt to disrupt, reverse-engineer, or gain unauthorized access to
            the Service or its infrastructure.
          </li>
          <li>
            Exceed or circumvent usage limits, rate limits, or plan
            entitlements.
          </li>
          <li>Resell or redistribute the Service without our permission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-content",
    title: "4. Your content and data",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          You retain all ownership of the files you upload and the datasets we
          generate for you.
        </li>
        <li>
          You grant us a limited license to process your content solely to
          provide the Service to you.
        </li>
        <li>
          We do not use your uploaded files to train YoDataSet&rsquo;s own models
          or any third-party models, except where you explicitly opt in.
        </li>
        <li>
          Our handling of personal data is described in our{" "}
          <Link href="/privacy" className="text-[#028090] hover:underline">
            Privacy Policy
          </Link>
          .
        </li>
      </ul>
    ),
  },
  {
    id: "plans-billing",
    title: "5. Plans, billing, and trials",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Paid plans are billed in advance on a recurring basis until cancelled.
        </li>
        <li>
          Payments are processed by a third-party payment processor; by
          purchasing a plan you also agree to their terms.
        </li>
        <li>
          You can cancel at any time; cancellation takes effect at the end of the
          current billing period.
        </li>
        <li>
          Except where required by law, fees already paid are non-refundable.
        </li>
        <li>
          Free trials may be subject to additional limits, including automatic
          deletion of files after 24 hours.
        </li>
      </ul>
    ),
  },
  {
    id: "availability",
    title: "6. Service availability",
    body: (
      <p>
        We work to keep the Service available and reliable, but we do not
        guarantee uninterrupted or error-free operation. We may modify, suspend,
        or discontinue features from time to time. Planned maintenance and
        material changes will be communicated where reasonably practicable.
      </p>
    ),
  },
  {
    id: "ip",
    title: "7. Intellectual property",
    body: (
      <p>
        The Service, including its software, design, and branding, is owned by
        YoDataSet and protected by intellectual property laws. These Terms do not
        grant you any rights to our trademarks or other intellectual property
        except the limited right to use the Service as intended.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers",
    body: (
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; without warranties of any kind, whether express or
        implied, including fitness for a particular purpose and non-infringement.
        Automated cleaning, OCR, and transcription may contain errors, and you
        are responsible for reviewing outputs before relying on them.
      </p>
    ),
  },
  {
    id: "liability",
    title: "9. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, YoDataSet will not be liable for
        any indirect, incidental, special, or consequential damages, or for loss
        of data, revenue, or profits. Our total liability arising out of or
        relating to the Service will not exceed the amounts you paid us in the 12
        months preceding the claim.
      </p>
    ),
  },
  {
    id: "termination",
    title: "10. Suspension and termination",
    body: (
      <p>
        You may stop using the Service and delete your account at any time. We may
        suspend or terminate your access if you breach these Terms or use the
        Service in a way that risks harm to us, other users, or third parties.
        Upon termination, your right to use the Service ends, and we will handle
        your data as described in our Privacy Policy.
      </p>
    ),
  },
  {
    id: "changes",
    title: "11. Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time. Material changes will be
        notified via email or an in-app notice before taking effect. Your
        continued use of the Service after changes take effect constitutes
        acceptance of the updated Terms.
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
          Contact:{" "}
          <a
            href="mailto:legal@yodataset.com"
            className="text-[#028090] hover:underline"
          >
            legal@yodataset.com
          </a>
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-[#4A6461] leading-relaxed">
            Last updated: July 18, 2026
          </p>

          <div className="mt-8">
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
