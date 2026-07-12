// =============================================================================
// SUPABASE AUTH CONFIGURATION
// =============================================================================

import { createSupabaseClient } from "@/lib/supabase/server";

export async function getServerSession() {
  try {
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
  } catch (error) {
    console.error("[AUTH] getServerSession error:", error);
    return null;
  }
}

export async function signInWithPassword(email: string, password: string) {
  try {
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
  } catch (error) {
    console.error("[AUTH] signIn unexpected error:", error);
    return { error: "Authentication failed" };
  }
}

export async function signInWithMagicLink(email: string) {
  try {
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
  } catch (error) {
    console.error("[AUTH] magic link unexpected error:", error);
    return { error: "Failed to send magic link" };
  }
}

export async function signOut() {
  try {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("[AUTH] signOut error:", error);
  }
}

