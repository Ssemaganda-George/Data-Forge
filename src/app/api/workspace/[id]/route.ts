import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteParams = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await authenticateRequest(_req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await db.fileRecord.findFirst({
    where: {
      id: params.id,
      batch: { project: { userId: session.user.id } },
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  await db.fileRecord.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
