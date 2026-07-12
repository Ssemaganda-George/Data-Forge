// =============================================================================
// SUPABASE AUTH CONFIGURATION
// =============================================================================

import { createSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { hashApiKey, looksLikeApiKey } from "@/lib/api-keys";

// Accepts either the browser session cookie or an `Authorization: Bearer dfk_...`
// API key, so external callers (scripts, notebooks, MCP tools) can hit the same
// routes as the dashboard.
export async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (bearer && looksLikeApiKey(bearer)) {
    const record = await db.apiKey.findFirst({
      where: { keyHash: hashApiKey(bearer), revokedAt: null },
      include: { user: true },
    });
    if (!record) return null;

    db.apiKey
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});

    return {
      user: {
        id: record.user.id,
        email: record.user.email,
        name: record.user.name,
      },
    };
  }

  return getServerSession();
}

export async function getServerSession() {
  try {
    const supabase = createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    let appUser = await supabase
      .from("User")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!appUser.data) {
      const { data: newUser, error: insertError } = await supabase
        .from("User")
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0],
          image: user.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (insertError || !newUser) {
        console.error("[AUTH] Failed to create app user:", insertError);
        return null;
      }
      appUser = { data: newUser } as any;
    }

    return {
      user: {
        id: appUser.data.id,
        email: appUser.data.email,
        name: appUser.data.name,
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

