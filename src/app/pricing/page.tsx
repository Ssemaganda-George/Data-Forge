"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { PLANS } from "@/lib/plans";
import { ContactForm } from "@/components/contact-form";
import { Check, Sparkles } from "lucide-react";

export default function PricingPage() {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-[620px] text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
              Simple, credits-based pricing
            </h1>
            <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
              Pay for what you actually process. Spreadsheets and text are cheap;
              audio and OCR cost more because they&apos;re more expensive to run.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {PLANS.map((plan) => {
              const featured = plan.featured;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl p-6 ${
                    featured
                      ? "border-2 border-[#028090]"
                      : "border border-[#E5E7EB]"
                  }`}
                >
                  {featured && (
                    <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#028090] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      <Sparkles size={11} />
                      Most popular
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#0B2E2C]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#4A6461] mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-[#0B2E2C]">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-[#4A6461]">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-[#E5E7EB] my-4" />

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-xs text-[#4A6461] flex items-start gap-2"
                      >
                        <Check
                          size={14}
                          className="mt-0.5 text-[#028090] shrink-0"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block text-center text-sm font-medium rounded-md px-4 py-2 transition-colors ${
                      featured
                        ? "text-white bg-[#028090] hover:bg-[#026c78]"
                        : "text-[#0B2E2C] border border-[#E5E7EB] hover:bg-[#F7FAF9]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-[#4A6461] max-w-2xl mx-auto">
            1 credit is roughly 1MB of spreadsheet or text data. Audio and OCR
            use more credits per file since they cost more to process.
          </p>
          <p className="mt-2 text-center text-sm text-[#4A6461] max-w-2xl mx-auto">
            Need more mid-month? Buy a top-up pack anytime — no forced upgrade.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-semibold text-[#0B2E2C] mb-4">
              Need something custom?
            </h2>
            <p className="text-sm text-[#4A6461] mb-6">
              We work with research labs, NGOs, and government bodies on tailored
              data-cleaning pipelines and private deployments.
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors"
            >
              Talk to us
            </button>
          </div>
        </section>

        <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
      </main>
    </div>
  );
}
