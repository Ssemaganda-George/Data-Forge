// =============================================================================
// SUPABASE AUTH CONFIGURATION
// =============================================================================

import { createSupabaseClient } from "@/lib/supabase/server";

export async function getServerSession() {
  const supabase = createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appUser } = await supabase
    .from("User")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!appUser) return null;

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      name: appUser.name,
    },
  };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[AUTH] signIn error:", error.message);
    return { error: error.message };
  }

  return { user: data.user };
}

export async function signInWithMagicLink(email: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("[AUTH] magic link error:", error.message);
    return { error: error.message };
  }

  return { sent: true };
}

export async function signOut() {
  const supabase = createSupabaseClient();
  await supabase.auth.signOut();
}

