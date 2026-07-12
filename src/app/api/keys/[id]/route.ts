import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = await db.apiKey.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.apiKey.update({
    where: { id: key.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ revoked: true });
}
