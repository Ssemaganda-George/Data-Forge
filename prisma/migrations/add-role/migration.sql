-- Add role column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'DEVELOPER';

-- Update existing users to have DEVELOPER role if they don't have one
UPDATE "User" SET role = 'DEVELOPER' WHERE role IS NULL OR role = '';

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User" (role);
