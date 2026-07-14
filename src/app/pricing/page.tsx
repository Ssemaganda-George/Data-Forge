import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";

export const metadata = {
  title: "Pricing · YoDataSet",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals exploring clean data.",
    features: [
      "500MB processed per month",
      "CSV and JSON export",
      "Basic confidence scoring",
      "Community support",
    ],
    cta: "Sign up free",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For startups and small teams shipping models.",
    features: [
      "20GB processed per month",
      "CSV, JSON, Parquet, and COCO export",
      "Auto-generated Data Cards",
      "Priority processing queue",
      "API access with keys",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/signup",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "on request",
    description: "For institutions and large-scale deployments.",
    features: [
      "Unlimited processing",
      "Custom pipeline templates",
      "Dedicated support and onboarding",
      "SLA and private deployment",
      "Advanced security and audit logs",
    ],
    cta: "Contact sales",
    href: "/signup",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="mx-auto max-w-[620px] text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#0B2E2C] leading-tight tracking-tight">
              Simple, usage-based pricing
            </h1>
            <p className="mt-4 text-lg text-[#4A6461] leading-relaxed">
              Start free, scale as you process more data. No hidden fees, no
              minimum commitment.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white border rounded-xl p-6 ${
                  plan.featured
                    ? "border-[#028090] shadow-none"
                    : "border-[#E5E7EB]"
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#0B2E2C]">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#4A6461] mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-semibold text-[#0B2E2C]">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#4A6461] ml-1">
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-xs text-[#4A6461] flex items-start gap-2"
                    >
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#028090] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center text-sm font-medium rounded-md px-4 py-2 transition-colors ${
                    plan.featured
                      ? "text-white bg-[#028090] hover:bg-[#026c78]"
                      : "text-[#0B2E2C] border border-[#E5E7EB] hover:bg-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
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
            <Link
              href="/signup"
              className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
