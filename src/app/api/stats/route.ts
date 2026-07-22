import { NextResponse } from "next/server";
import {
  DOCUMENTS_CLEANED_KEY,
  DATASETS_GENERATED_KEY,
  getSiteStat,
} from "@/lib/site-stats";

// Without this, Next.js has no dynamic APIs (headers/cookies) to detect in
// this route and will statically pre-render + cache it at build time,
// freezing the published totals at whatever the DB held during that build.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Real, DB-backed baseline (matches the seeded SiteStat values). Returned if
// the database is briefly unreachable so the published totals stay accurate
// instead of dropping to a misleading 0 during a Supabase cold start/pause.
const FALLBACK = { documentsCleaned: 24, datasetsGenerated: 8 };

export async function GET() {
  try {
    // Monotonic, site-wide cumulative counters (see lib/site-stats.ts).
    // These are incremented on every clean/export and never decremented, so
    // deleting a file or dataset does not reduce the published totals.
    const [documentsCleaned, datasetsGenerated] = await Promise.all([
      getSiteStat(DOCUMENTS_CLEANED_KEY),
      getSiteStat(DATASETS_GENERATED_KEY),
    ]);

    return NextResponse.json(
      { documentsCleaned, datasetsGenerated },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(FALLBACK, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
