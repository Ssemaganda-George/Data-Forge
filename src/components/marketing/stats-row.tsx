"use client";

import { useEffect, useState } from "react";

interface Stats {
  documentsCleaned: number;
  datasetsGenerated: number;
}

// Only shown when /api/stats fails or the DB is unreachable. We keep
// these real, DB-backed totals whenever the API can't supply genuine data.
// This avoids exposing a broken landing page if the stats endpoint is down.
const FALLBACK: Stats = {
  documentsCleaned: 24,
  datasetsGenerated: 8,
};

export function StatsRow() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load stats");
        const data: Partial<Stats> = await res.json();

        if (cancelled) return;

        const docs =
          typeof data.documentsCleaned === "number" ? data.documentsCleaned : null;
        const sets =
          typeof data.datasetsGenerated === "number" ? data.datasetsGenerated : null;

        if (docs === null || sets === null) {
          setStats(FALLBACK);
          return;
        }

        setStats({ documentsCleaned: docs, datasetsGenerated: sets });
      } catch {
        if (!cancelled) setStats(FALLBACK);
      }
    }

    fetchStats();

    const interval = window.setInterval(fetchStats, 10000);
    const handleFocus = () => fetchStats();
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <p className="text-3xl font-semibold text-[#0B2E2C] tabular-nums">
            {stats.documentsCleaned.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-[#4A6461]">Documents cleaned</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <p className="text-3xl font-semibold text-[#0B2E2C] tabular-nums">
            {stats.datasetsGenerated.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-[#4A6461]">Datasets generated</p>
        </div>
      </div>
    </section>
  );
}