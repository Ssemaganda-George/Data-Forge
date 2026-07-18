import { NextResponse } from "next/server";
import {
  DOCUMENTS_CLEANED_KEY,
  DATASETS_GENERATED_KEY,
  getSiteStat,
} from "@/lib/site-stats";

export async function GET() {
  try {
    // Monotonic, site-wide cumulative counters (see lib/site-stats.ts).
    // These are incremented on every clean/export and never decremented, so
    // deleting a file or dataset does not reduce the published totals.
    const [documentsCleaned, datasetsGenerated] = await Promise.all([
      getSiteStat(DOCUMENTS_CLEANED_KEY),
      getSiteStat(DATASETS_GENERATED_KEY),
    ]);

    return NextResponse.json({ documentsCleaned, datasetsGenerated });
  } catch {
    return NextResponse.json(
      { documentsCleaned: 0, datasetsGenerated: 0 },
      { status: 200 }
    );
  }
}
