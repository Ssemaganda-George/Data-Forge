"use client";

import { useEffect, useState } from "react";

interface Stats {
  documentsCleaned: number;
  datasetsGenerated: number;
}

const FALLBACK: Stats = {
  documentsCleaned: 0,
  datasetsGenerated: 0,
};

export function StatsRow() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Partial<Stats>) => {
        if (!cancelled) {
          setStats({
            documentsCleaned:
              typeof data.documentsCleaned === "number"
                ? data.documentsCleaned
                : FALLBACK.documentsCleaned,
            datasetsGenerated:
              typeof data.datasetsGenerated === "number"
                ? data.datasetsGenerated
                : FALLBACK.datasetsGenerated,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStats(FALLBACK);
      });

    return () => {
      cancelled = true;
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
