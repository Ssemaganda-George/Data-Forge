-- Credits-based pricing + anonymous trial carry-over

-- User: credit balance + trial carry-over
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsRemaining" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditsResetAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creditBalanceTopUp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialCarryOverId" TEXT;

-- CreditUsage: per-job credit deductions (authenticated usage only)
CREATE TABLE IF NOT EXISTS "CreditUsage" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "fileRecordId" TEXT,
  credits INTEGER NOT NULL,
  reason TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TrialUsage: anonymous trial jobs, kept separate from billing metrics
CREATE TABLE IF NOT EXISTS "TrialUsage" (
  id TEXT NOT NULL PRIMARY KEY,
  "ipHash" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "creditsUsed" INTEGER NOT NULL,
  "convertedToUserId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "CreditUsage_userId_idx" ON "CreditUsage" ("userId");
CREATE INDEX IF NOT EXISTS "CreditUsage_createdAt_idx" ON "CreditUsage" ("createdAt");
CREATE INDEX IF NOT EXISTS "TrialUsage_ipHash_idx" ON "TrialUsage" ("ipHash");
CREATE INDEX IF NOT EXISTS "TrialUsage_createdAt_idx" ON "TrialUsage" ("createdAt");
