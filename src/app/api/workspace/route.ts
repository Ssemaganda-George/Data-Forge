import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await db.fileRecord.findMany({
    where: {
      batch: { project: { userId: session.user.id } },
    },
    include: {
      batch: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    files: files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      fileType: f.fileType,
      sizeBytes: 0,
      status: f.status.toLowerCase(),
      cleaningActions: f.cleaningActions ?? [],
      confidenceScore: f.confidenceScore ?? 0,
      flaggedForReview: f.flaggedForReview,
      uploadedAt: f.createdAt.toISOString(),
      cleanedContent: "",
    })),
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.fileRecord.deleteMany({
    where: {
      batch: { project: { userId: session.user.id } },
    },
  });

  return NextResponse.json({ ok: true });
}
