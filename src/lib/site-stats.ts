import { db } from "@/lib/db";

export const DOCUMENTS_CLEANED_KEY = "documentsCleaned";
export const DATASETS_GENERATED_KEY = "datasetsGenerated";

const DEFAULT_BASE = 0;

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
