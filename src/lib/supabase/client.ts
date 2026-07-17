"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser code can only read env vars prefixed with NEXT_PUBLIC_.
// These are referenced as full literals so Next.js inlines them at build time.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY;

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase browser client is missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
}
