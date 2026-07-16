import type { User as SupabaseUser } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { hashApiKey, looksLikeApiKey } from "@/lib/api-keys";
import { getSiteUrl } from "@/lib/site-url";

export type AppSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

async function ensureAppUser(authUser: SupabaseUser) {
  const email = authUser.email;
  if (!email) return null;

  const existing = await db.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  return db.user.create({
    data: {
      id: authUser.id,
      email,
      name:
        (authUser.user_metadata?.name as string | undefined) ||
        email.split("@")[0],
      image: (authUser.user_metadata?.avatar_url as string | undefined) || null,
      role: "DEVELOPER",
    },
  });
}

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

export async function getServerSession(): Promise<AppSession | null> {
  try {
    const supabase = createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return null;

    const appUser = await db.user.findUnique({ where: { id: user.id } });
    if (!appUser) {
      const created = await ensureAppUser(user);
      if (!created) return null;

      return {
        user: {
          id: created.id,
          email: created.email,
          name: created.name,
        },
      };
    }

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

export async function requireServerSession(): Promise<AppSession> {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return session;
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

    if (!data.user) {
      return { error: "Authentication failed" };
    }

    const appUser = await ensureAppUser(data.user);
    
    if (appUser) {
      await db.user.update({
        where: { id: data.user.id },
        data: { lastLoginAt: new Date() },
      }).catch(() => {});
    }

    return { 
      user: data.user,
      role: appUser?.role || "DEVELOPER"
    };
  } catch (error) {
    console.error("[AUTH] signIn unexpected error:", error);
    return { error: "Authentication failed" };
  }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  name?: string
) {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      console.error("[AUTH] signUp error:", error.message);
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Sign up failed" };
    }

    if (data.user.identities?.length === 0) {
      return { error: "An account with this email already exists. Sign in instead." };
    }

    if (data.session) {
      await ensureAppUser(data.user);
      return { user: data.user };
    }

    return { needsEmailConfirmation: true };
  } catch (error) {
    console.error("[AUTH] signUp unexpected error:", error);
    return { error: "Sign up failed" };
  }
}

export async function signInWithMagicLink(email: string) {
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
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
