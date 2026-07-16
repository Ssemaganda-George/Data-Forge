import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  DOCUMENTS_CLEANED_KEY,
  DATASETS_GENERATED_KEY,
  getSiteStat,
} from "@/lib/site-stats";

export async function GET() {
  try {
    // Real, account-backed activity straight from the database.
    const [realDocs, realDatasets] = await Promise.all([
      db.fileRecord.count(),
      db.dataset.count(),
    ]);

    // Trial (anonymous) activity, persisted incrementally in SiteStat so it is
    // not lost between sessions. Starts at 0 and grows with each trial clean.
    const [trialDocs, trialDatasets] = await Promise.all([
      getSiteStat(DOCUMENTS_CLEANED_KEY),
      getSiteStat(DATASETS_GENERATED_KEY),
    ]);

    return NextResponse.json({
      documentsCleaned: realDocs + trialDocs,
      datasetsGenerated: realDatasets + trialDatasets,
    });
  } catch {
    return NextResponse.json(
      { documentsCleaned: 0, datasetsGenerated: 0 },
      { status: 200 }
    );
  }
}
