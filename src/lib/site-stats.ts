import { db } from "@/lib/db";

export const DOCUMENTS_CLEANED_KEY = "documentsCleaned";
export const DATASETS_GENERATED_KEY = "datasetsGenerated";

const DEFAULT_BASE = 0;

/**
 * Site-wide cumulative counters. These are MONOTONIC: they are incremented
 * every time a document is cleaned or a dataset is generated, and are NEVER
 * decremented. Deleting a file or dataset from the app therefore does not
 * reduce these numbers — the work was still performed by our system.
 *
 * The rows are seeded (see seedSiteStats) with the current real totals from
 * the database so the counter starts accurate, then only grows from there.
 */

/**
 * Atomically increment a numeric site stat and return the new value. If the
 * row does not exist yet, it is seeded at 0 plus the increment.
 */
export async function incrementSiteStat(
  key: string,
  by: number
): Promise<number> {
  const updated = await db.siteStat.upsert({
    where: { key },
    update: { value: { increment: by } },
    create: { key, value: by },
  });
  return updated.value;
}

export async function getSiteStat(key: string): Promise<number> {
  const row = await db.siteStat.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_BASE;
}

/**
 * Seed the cumulative counters with the current real database totals. This is
 * idempotent: if a counter already has a value it is left untouched (so we
 * never overwrite counters that have already grown past the seed point). Run
 * once at startup / deploy to initialise the monotonic baseline.
 */
export async function seedSiteStats(base: {
  documentsCleaned: number;
  datasetsGenerated: number;
}): Promise<void> {
  await db.$transaction([
    db.siteStat.upsert({
      where: { key: DOCUMENTS_CLEANED_KEY },
      update: {},
      create: { key: DOCUMENTS_CLEANED_KEY, value: base.documentsCleaned },
    }),
    db.siteStat.upsert({
      where: { key: DATASETS_GENERATED_KEY },
      update: {},
      create: { key: DATASETS_GENERATED_KEY, value: base.datasetsGenerated },
    }),
  ]);
}
