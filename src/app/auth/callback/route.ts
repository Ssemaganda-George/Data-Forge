import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const existing = await db.user.findUnique({ where: { id: data.user.id } });
      if (!existing) {
        await db.user.create({
          data: {
            id: data.user.id,
            email: data.user.email,
            name:
              (data.user.user_metadata?.name as string | undefined) ||
              data.user.email.split("@")[0],
            image:
              (data.user.user_metadata?.avatar_url as string | undefined) ||
              null,
          },
        });
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
