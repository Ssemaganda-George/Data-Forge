import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

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
