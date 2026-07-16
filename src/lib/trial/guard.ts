/**
 * Server-side abuse controls for the anonymous free trial.
 *
 * - Per-IP rate limit: max 3 trial jobs / IP / 24h.
 * - Hard daily budget ceiling on total estimated trial credit cost. Once the
 *   configured ceiling is hit, new trial jobs are rejected server-side so the
 *   trial can't be abused to run unlimited free processing.
 *
 * Uses process memory (pinned to globalThis for hot reload safety). In
 * production behind multiple instances you'd back this with Redis / KV — see
 * TRIAL_* env knobs below.
 */

const MAX_TRIALS_PER_IP = 3;
const TRIAL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

/** Daily credit-cost ceiling for ALL anonymous trial processing. */
export const TRIAL_DAILY_BUDGET_CREDITS = Number(
  process.env.TRIAL_DAILY_BUDGET_CREDITS ?? 75
);

interface IpEntry {
  hits: number[]; // timestamps within the window
}
interface BudgetEntry {
  spent: number; // credits spent today
  day: string; // YYYY-MM-DD key
}

declare global {
  // eslint-disable-next-line no-var
  var __yodatasetTrialGuard: {
    ips: Map<string, IpEntry>;
    budget: BudgetEntry;
  } | undefined;
}

const guard: { ips: Map<string, IpEntry>; budget: BudgetEntry } =
  globalThis.__yodatasetTrialGuard ??
  (globalThis.__yodatasetTrialGuard = {
    ips: new Map(),
    budget: { spent: 0, day: new Date().toISOString().slice(0, 10) },
  });

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function rollBudgetIfNewDay() {
  const t = todayKey();
  if (guard.budget.day !== t) {
    guard.budget = { spent: 0, day: t };
  }
}

/**
 * Validate a trial request. Returns either { ok: true } or { ok: false, code,
 * message }. Call BEFORE running any processing.
 */
export function checkTrialAllowance(
  ip: string,
  estimatedCredits: number
): { ok: true } | { ok: false; code: string; message: string } {
  rollBudgetIfNewDay();

  // 1. Daily budget ceiling (checked first so we stop abuse globally).
  if (guard.budget.spent + estimatedCredits > TRIAL_DAILY_BUDGET_CREDITS) {
    return {
      ok: false,
      code: "budget_exceeded",
      message:
        "Anonymous trial processing is at capacity for today. Please sign up for unlimited free processing.",
    };
  }

  // 2. Per-IP rate limit.
  const now = Date.now();
  const entry = guard.ips.get(ip) ?? { hits: [] };
  const recent = entry.hits.filter((t) => now - t < TRIAL_WINDOW_MS);
  if (recent.length >= MAX_TRIALS_PER_IP) {
    return {
      ok: false,
      code: "rate_limited",
      message:
        "You've reached the free trial limit (3 files per 24 hours). Create a free account to keep cleaning.",
    };
  }

  return { ok: true };
}

/**
 * Commit a trial request AFTER it passes validation. Records the IP hit and the
 * credit spend against the daily budget. Call whether or not processing later
 * succeeds — the cost is reserved up front.
 */
export function recordTrialUsage(ip: string, estimatedCredits: number): void {
  rollBudgetIfNewDay();
  const now = Date.now();
  const entry = guard.ips.get(ip) ?? { hits: [] };
  entry.hits = entry.hits.filter((t) => now - t < TRIAL_WINDOW_MS);
  entry.hits.push(now);
  guard.ips.set(ip, entry);
  guard.budget.spent += estimatedCredits;
}

export function remainingTrialsForIp(ip: string): number {
  const now = Date.now();
  const entry = guard.ips.get(ip);
  if (!entry) return MAX_TRIALS_PER_IP;
  const recent = entry.hits.filter((t) => now - t < TRIAL_WINDOW_MS);
  return Math.max(0, MAX_TRIALS_PER_IP - recent.length);
}

export { MAX_TRIALS_PER_IP, TRIAL_WINDOW_MS };
