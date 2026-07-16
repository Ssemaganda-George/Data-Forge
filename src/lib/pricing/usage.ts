import { db } from "@/lib/db";
import {
  getPlanMonthlyCredits,
  DEFAULT_PLAN_ID,
  type PlanId,
} from "./plans";

export interface CreditBalance {
  remaining: number;
  limit: number; // monthly plan allowance (Infinity for enterprise)
  topUp: number;
  resetAt: Date;
  unlimited: boolean;
}

const RESET_INTERVAL_DAYS = 30;

/**
 * Ensure a user's credit balance is seeded for the current billing period.
 * If creditsResetAt is in the past, refill the plan allowance (minus already
 * used top-ups are preserved via creditBalanceTopUp), then bump the reset date.
 */
export async function ensureCreditBalance(userId: string): Promise<CreditBalance> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const now = new Date();
  const planId = (user.role === "ADMIN" ? "pro" : DEFAULT_PLAN_ID) as PlanId;
  const limit = getPlanMonthlyCredits(planId);

  if (limit === Number.MAX_SAFE_INTEGER) {
    return {
      remaining: Number.MAX_SAFE_INTEGER,
      limit: Number.MAX_SAFE_INTEGER,
      topUp: 0,
      resetAt: user.creditsResetAt,
      unlimited: true,
    };
  }

  if (now >= user.creditsResetAt) {
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + RESET_INTERVAL_DAYS);
    await db.user.update({
      where: { id: userId },
      data: {
        creditsRemaining: limit + user.creditBalanceTopUp,
        creditsResetAt: nextReset,
        creditBalanceTopUp: 0,
      },
    });
    return {
      remaining: limit + user.creditBalanceTopUp,
      limit,
      topUp: 0,
      resetAt: nextReset,
      unlimited: false,
    };
  }

  return {
    remaining: user.creditsRemaining,
    limit,
    topUp: user.creditBalanceTopUp,
    resetAt: user.creditsResetAt,
    unlimited: false,
  };
}

/**
 * Deduct credits for a completed job. Lets the current job finish even if it
 * pushes the user into overage — we never hard-block mid-job. Returns the
 * resulting balance and whether the user is now over their monthly allowance.
 */
export async function deductCredits(params: {
  userId: string;
  credits: number;
  reason: string;
  fileRecordId?: string;
}): Promise<{ balance: CreditBalance; overage: boolean }> {
  const balance = await ensureCreditBalance(params.userId);

  if (balance.unlimited) {
    await db.creditUsage.create({
      data: {
        userId: params.userId,
        credits: params.credits,
        reason: params.reason,
        fileRecordId: params.fileRecordId,
      },
    });
    return { balance, overage: false };
  }

  const newRemaining = Math.max(0, balance.remaining - params.credits);
  const topUpCarry = Math.max(0, balance.topUp - Math.max(0, params.credits - balance.remaining));

  await db.$transaction([
    db.user.update({
      where: { id: params.userId },
      data: {
        creditsRemaining: newRemaining,
        creditBalanceTopUp: topUpCarry,
      },
    }),
    db.creditUsage.create({
      data: {
        userId: params.userId,
        credits: params.credits,
        reason: params.reason,
        fileRecordId: params.fileRecordId,
      },
    }),
  ]);

  return {
    balance: { ...balance, remaining: newRemaining, topUp: topUpCarry },
    overage: newRemaining <= 0,
  };
}

/** Add a one-time top-up pack to a user's balance. */
export async function addTopUpPack(
  userId: string,
  credits: number
): Promise<CreditBalance> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  await db.user.update({
    where: { id: userId },
    data: {
      creditBalanceTopUp: { increment: credits },
      creditsRemaining: { increment: credits },
    },
  });
  return ensureCreditBalance(userId);
}

/**
 * Whether a user WOULD have enough credits for an estimated cost. Used to warn
 * before submission and to drive the overage prompt after a job completes.
 */
export async function hasEnoughCredits(
  userId: string,
  estimatedCredits: number
): Promise<boolean> {
  const balance = await ensureCreditBalance(userId);
  if (balance.unlimited) return true;
  return balance.remaining >= estimatedCredits;
}
