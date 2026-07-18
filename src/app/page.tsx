import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { StatsRow } from "@/components/marketing/stats-row";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UseCaseCards } from "@/components/marketing/use-case-cards";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { Footer } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />
      <main>
        <Hero />
        <StatsRow />
        <HowItWorks />
        <UseCaseCards />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
