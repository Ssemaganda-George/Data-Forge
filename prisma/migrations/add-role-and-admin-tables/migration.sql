-- Add role and lastLoginAt columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'DEVELOPER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP;

-- Update existing users to have DEVELOPER role if they don't have one
UPDATE "User" SET role = 'DEVELOPER' WHERE role IS NULL OR role = '';

-- Create indexes
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User" (role);

-- Create Inquiry table
CREATE TABLE IF NOT EXISTS "Inquiry" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "currentPeriodStart" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currentPeriodEnd" TIMESTAMP NOT NULL,
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Inquiry_userId_idx" ON "Inquiry" ("userId");
CREATE INDEX IF NOT EXISTS "Inquiry_createdAt_idx" ON "Inquiry" ("createdAt");
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription" ("userId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription" (status);
