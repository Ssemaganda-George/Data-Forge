import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/secret-box";
import { z } from "zod";

const kaggleSchema = z.object({
  username: z.string().min(1),
  key: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await db.platformConnection.findUnique({
    where: {
      userId_platform: { userId: session.user.id, platform: "KAGGLE" },
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

  const parsed = kaggleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, key } = parsed.data;

  await db.platformConnection.upsert({
    where: {
      userId_platform: { userId: session.user.id, platform: "KAGGLE" },
    },
    create: {
      userId: session.user.id,
      platform: "KAGGLE",
      username,
      credential: encryptSecret(key),
    },
    update: { username, credential: encryptSecret(key) },
  });

  return NextResponse.json({ ok: true, platform: "kaggle", username });
}

export async function DELETE(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.platformConnection.deleteMany({
    where: { userId: session.user.id, platform: "KAGGLE" },
  });

  return NextResponse.json({ ok: true });
}
