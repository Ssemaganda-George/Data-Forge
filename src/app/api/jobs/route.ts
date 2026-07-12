import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  const fileId = searchParams.get("fileId");

  if (fileId) {
    const file = await db.fileRecord.findFirst({
      where: {
        id: fileId,
        batch: { project: { userId: session.user.id } },
      },
    });
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(file);
  }

  if (batchId) {
    const batch = await db.uploadBatch.findFirst({
      where: {
        id: batchId,
        project: { userId: session.user.id },
      },
      include: { files: true },
    });
    if (!batch) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(batch);
  }

  return NextResponse.json({ error: "batchId or fileId required" }, { status: 400 });
}
