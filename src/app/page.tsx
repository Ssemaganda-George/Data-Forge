import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { StatsRow } from "@/components/marketing/stats-row";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UseCaseCards } from "@/components/marketing/use-case-cards";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { TrialWidget } from "@/components/marketing/trial-widget";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />
      <main>
        <Hero />
        <StatsRow />
        <section id="try-free" className="mx-auto max-w-2xl px-6 py-12">
          <TrialWidget />
        </section>
        <HowItWorks />
        <UseCaseCards />
        <ClosingCta />
      </main>
    </div>
  );
}
