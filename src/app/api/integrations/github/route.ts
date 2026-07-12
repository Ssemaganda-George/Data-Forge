import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/secret-box";
import { z } from "zod";

const githubSchema = z.object({
  username: z.string().min(1),
  token: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await db.platformConnection.findUnique({
    where: {
      userId_platform: { userId: session.user.id, platform: "GITHUB" },
    },
    select: { username: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ connected: !!conn, username: conn?.username ?? null });
}

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = githubSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, token } = parsed.data;

  await db.platformConnection.upsert({
    where: {
      userId_platform: { userId: session.user.id, platform: "GITHUB" },
    },
    create: {
      userId: session.user.id,
      platform: "GITHUB",
      username,
      credential: encryptSecret(token),
    },
    update: { username, credential: encryptSecret(token) },
  });

  return NextResponse.json({ ok: true, platform: "github", username });
}

export async function DELETE(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.platformConnection.deleteMany({
    where: { userId: session.user.id, platform: "GITHUB" },
  });

  return NextResponse.json({ ok: true });
}
