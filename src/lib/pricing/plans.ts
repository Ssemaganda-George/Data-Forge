/**
 * Credits-based pricing tiers.
 *
 * Replaces the old GB-based quota model. Credits reflect real processing cost
 * (see lib/pricing/creditCosts.ts) so audio / OCR — the expensive paths — cost
 * more than spreadsheets / text.
 */

export type PlanId = "freemium" | "starter" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  /** Monthly credit allowance for this plan. */
  monthlyCredits: number | null; // null = unlimited (enterprise)
  quota: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
  /** One-time credit top-up pack price (shown on overage). */
  topUpPack?: { price: string; credits: number };
}

export const PLANS: Plan[] = [
  {
    id: "freemium",
    name: "Freemium",
    price: "$0",
    period: "/ month",
    monthlyCredits: 500,
    quota: "500 credits / month",
    description: "For individuals exploring clean data.",
    features: [
      "500 credits / month",
      "CSV & JSON export",
      "Basic confidence scoring",
      "Community support",
    ],
    cta: "Sign up free",
    href: "/signup",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    period: "/ month",
    monthlyCredits: 15000,
    quota: "15,000 credits / month",
    description: "For students and small projects.",
    features: [
      "15,000 credits / month",
      "CSV & JSON export",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$35",
    period: "/ month",
    monthlyCredits: 75000,
    quota: "75,000 credits / month",
    description: "For startups and small teams shipping models.",
    features: [
      "75,000 credits / month",
      "All export formats",
      "PII redaction",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/signup",
    featured: true,
    topUpPack: { price: "$9", credits: 5000 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    monthlyCredits: null,
    quota: "Unlimited",
    description: "For institutions and large-scale deployments.",
    features: [
      "Unlimited processing",
      "Custom pipelines",
      "SLA & dedicated support",
      "SSO / SAML",
    ],
    cta: "Contact sales",
    href: "/signup",
  },
];

/** The currently-default plan for new accounts (no billing integration yet). */
export const DEFAULT_PLAN_ID: PlanId = "pro";

/** One-time top-up pack offered on overage (falls back to Pro's pack). */
export const DEFAULT_TOP_UP_PACK = {
  price: "$9",
  credits: 5000,
};

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function getPlanMonthlyCredits(id: PlanId): number {
  const plan = getPlan(id);
  return plan.monthlyCredits ?? Number.MAX_SAFE_INTEGER;
}
