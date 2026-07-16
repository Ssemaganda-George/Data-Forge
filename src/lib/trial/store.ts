/**
 * Short-lived, session-scoped storage for anonymous trial results.
 *
 * Trial results are written here (not to the database, not to the user's
 * workspace) and auto-expire after 24h. Each trial gets a stable `trialId`
 * that the client can pass to /signup so the result carries into the new
 * account's first project. This keeps anonymous usage completely separate
 * from authenticated billing/usage metrics.
 */

import { randomUUID } from "crypto";

export interface TrialResult {
  trialId: string;
  originalName: string;
  fileType: string;
  sizeBytes: number;
  cleaningActions: { type: string; description: string }[];
  confidenceScore: number;
  flaggedForReview: boolean;
  cleanedContent: string;
  creditsUsed: number;
  createdAt: number;
}

const TTL_MS = 24 * 60 * 60 * 1000; // 24h

declare global {
  // eslint-disable-next-line no-var
  var __yodatasetTrialStore:
    | Map<string, { result: TrialResult; expiresAt: number }>
    | undefined;
}

const store: Map<string, { result: TrialResult; expiresAt: number }> =
  globalThis.__yodatasetTrialStore ??
  (globalThis.__yodatasetTrialStore = new Map());

function sweep() {
  const now = Date.now();
  store.forEach((v, id) => {
    if (v.expiresAt <= now) store.delete(id);
  });
}

export function putTrialResult(
  result: Omit<TrialResult, "trialId" | "createdAt">
): TrialResult {
  sweep();
  const full: TrialResult = {
    ...result,
    trialId: randomUUID(),
    createdAt: Date.now(),
  };
  store.set(full.trialId, { result: full, expiresAt: Date.now() + TTL_MS });
  return full;
}

export function getTrialResult(trialId: string): TrialResult | null {
  sweep();
  const entry = store.get(trialId);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(trialId);
    return null;
  }
  return entry.result;
}

export function deleteTrialResult(trialId: string): void {
  store.delete(trialId);
}
