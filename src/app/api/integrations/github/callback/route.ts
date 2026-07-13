import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/secret-box";

const SETTINGS_URL = "/settings/integrations";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get("gh_oauth_state")?.value;

  const fail = (reason: string) => {
    const url = new URL(SETTINGS_URL, req.url);
    url.searchParams.set("github_error", reason);
    const res = NextResponse.redirect(url);
    res.cookies.delete("gh_oauth_state");
    return res;
  };

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("invalid_state");
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return fail("not_configured");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/github/callback`,
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenRes.ok || !tokenData.access_token) {
    return fail(tokenData.error ?? "token_exchange_failed");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const userData = (await userRes.json()) as { login?: string };
  if (!userRes.ok || !userData.login) {
    return fail("user_lookup_failed");
  }

  await db.platformConnection.upsert({
    where: {
      userId_platform: { userId: session.user.id, platform: "GITHUB" },
    },
    create: {
      userId: session.user.id,
      platform: "GITHUB",
      username: userData.login,
      credential: encryptSecret(tokenData.access_token),
    },
    update: { username: userData.login, credential: encryptSecret(tokenData.access_token) },
  });

  const res = NextResponse.redirect(new URL(SETTINGS_URL, req.url));
  res.cookies.delete("gh_oauth_state");
  return res;
}
