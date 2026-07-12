import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { buildColabNotebook } from "@/lib/colab-notebook";
import type { ExportFormat } from "@/lib/export-builder";

const FORMATS = new Set(["CSV", "JSON", "PARQUET", "COCO"]);

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const fileId = searchParams.get("fileId") ?? undefined;
  const batchId = searchParams.get("batchId") ?? undefined;
  const formatParam = searchParams.get("format") ?? "JSON";
  const format = FORMATS.has(formatParam)
    ? (formatParam as ExportFormat)
    : "JSON";

  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;

  const notebook = buildColabNotebook(baseUrl, { fileId, batchId, format });
  const suffix = fileId ? "file" : batchId ? "batch" : "workspace";

  return new NextResponse(notebook, {
    headers: {
      "Content-Type": "application/x-ipynb+json",
      "Content-Disposition": `attachment; filename="dataforge-${suffix}.ipynb"`,
    },
  });
}
