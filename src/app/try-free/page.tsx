import { Navbar } from "@/components/marketing/navbar";
import { TrialWidget } from "@/components/marketing/trial-widget";

export const metadata = {
  title: "Try it free",
  description: "Drop a file and watch it get cleaned — no account needed.",
};

export default function TryFreePage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#0B2E2C]">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <TrialWidget />
      </main>
    </div>
  );
}
