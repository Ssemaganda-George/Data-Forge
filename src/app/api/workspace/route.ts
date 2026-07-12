import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFiles } from "@/lib/memory-store";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = getFiles(session.user.id).map((f) => ({
    id: f.id,
    originalName: f.originalName,
    fileType: f.fileType,
    sizeBytes: f.sizeBytes,
    status: f.status,
    cleaningActions: f.cleaningActions,
    confidenceScore: f.confidenceScore,
    flaggedForReview: f.flaggedForReview,
    uploadedAt: f.uploadedAt,
    cleanedContent: f.cleanedContent,
  }));

  return NextResponse.json({ files });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { clearFiles } = await import("@/lib/memory-store");
  clearFiles(session.user.id);
  return NextResponse.json({ ok: true });
}
