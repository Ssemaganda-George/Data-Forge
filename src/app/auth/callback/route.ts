import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { importTrialIntoNewAccount } from "@/lib/trial/import";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const explicitRedirect = requestUrl.searchParams.get("redirectTo");
  let next = explicitRedirect ?? requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const existing = await db.user.findUnique({ where: { id: data.user.id } });
      if (!existing) {
        const trialId = requestUrl.searchParams.get("trial") ?? null;
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
            role: "DEVELOPER",
            trialCarryOverId: trialId,
          },
        });
      } else {
        await db.user.update({
          where: { id: data.user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {});

        // Only default admins to /admin when no explicit destination was given.
        if (existing.role === "ADMIN" && !explicitRedirect) {
          next = "/admin";
        }
      }
    }
  }

  // Behind a reverse proxy (Railway), requestUrl.origin resolves to the
  // internal container address (e.g. http://0.0.0.0:8080). Use the public
  // host from x-forwarded-host so the redirect points at the real domain.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? requestUrl.origin
      : `${forwardedProto}://${forwardedHost}`;

  const redirectUrl = new URL(next, baseUrl);
  return NextResponse.redirect(redirectUrl);
}
