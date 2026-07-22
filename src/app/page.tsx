import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { StatsRow } from "@/components/marketing/stats-row";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UseCaseCards } from "@/components/marketing/use-case-cards";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { Footer } from "@/components/marketing/footer";
import {
  DOCUMENTS_CLEANED_KEY,
  DATASETS_GENERATED_KEY,
  getSiteStat,
} from "@/lib/site-stats";

// Fetch real counts on the server so the initial HTML already reflects the
// true totals — no flash of fallback numbers while the client re-fetches.
export const revalidate = 0;

async function getInitialStats() {
  try {
    const [documentsCleaned, datasetsGenerated] = await Promise.all([
      getSiteStat(DOCUMENTS_CLEANED_KEY),
      getSiteStat(DATASETS_GENERATED_KEY),
    ]);
    return { documentsCleaned, datasetsGenerated };
  } catch {
    return null;
  }
}

export default async function LandingPage() {
  const initialStats = await getInitialStats();

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />
      <main>
        <Hero />
        <StatsRow initialStats={initialStats} />
        <HowItWorks />
        <UseCaseCards />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
