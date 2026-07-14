import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataset = await db.dataset.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      files: {
        include: {
          fileRecord: {
            select: {
              id: true,
              originalName: true,
              fileType: true,
              sizeBytes: true,
              confidenceScore: true,
              flaggedForReview: true,
              cleanedContent: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }

  const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();

  if (format === "json") {
    const payload = {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      fileCount: dataset.fileCount,
      totalSizeBytes: dataset.totalSizeBytes,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
      files: dataset.files.map((f) => ({
        id: f.fileRecord.id,
        originalName: f.fileRecord.originalName,
        fileType: f.fileRecord.fileType,
        sizeBytes: f.fileRecord.sizeBytes,
        confidenceScore: f.fileRecord.confidenceScore,
        flaggedForReview: f.fileRecord.flaggedForReview,
        cleanedContent: f.fileRecord.cleanedContent,
        createdAt: f.fileRecord.createdAt,
      })),
    };

    return NextResponse.json(payload);
  }

  if (format === "csv") {
    const rows = dataset.files.map((f) => {
      const rec = f.fileRecord;
      const content = (rec.cleanedContent || "").replace(/"/g, '""');
      return [
        rec.id,
        rec.originalName,
        rec.fileType,
        rec.sizeBytes ?? 0,
        rec.confidenceScore ?? 0,
        rec.flaggedForReview ? "true" : "false",
        `"${content}"`,
      ].join(",");
    });

    const header = "id,originalName,fileType,sizeBytes,confidenceScore,flaggedForReview,cleanedContent";
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${dataset.name.replace(/[^\w.-]+/g, "_")}.csv"`,
      },
    });
  }

  return NextResponse.json(
    { error: "Unsupported format. Use ?format=json or ?format=csv" },
    { status: 400 }
  );
}
