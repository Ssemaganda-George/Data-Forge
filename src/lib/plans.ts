import { DEFAULT_PLAN_ID, getPlan, getPlanMonthlyCredits, PLANS } from "./pricing/plans";
export { PLANS, getPlan, getPlanMonthlyCredits, DEFAULT_PLAN_ID } from "./pricing/plans";
export type { Plan, PlanId } from "./pricing/plans";

// Backwards-compatible alias still referenced in some pages.
export const CURRENT_PLAN_ID = DEFAULT_PLAN_ID;
