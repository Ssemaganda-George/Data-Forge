import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import {
  buildExportZip,
  type ExportFormat,
} from "@/lib/export-builder";
import { pushToGitHub, pushToKaggle } from "@/lib/export-destinations";
import { resolveExportFiles } from "@/lib/export-scope";

function safeFilename(name: string) {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 80) || "export";
}

function zipFilename(files: { originalName: string }[], format: string, scope: { fileId?: string; batchId?: string }) {
  const ts = Date.now();
  if (scope.fileId && files[0]) {
    return `${safeFilename(files[0].originalName)}-${format.toLowerCase()}-${ts}.zip`;
  }
  if (scope.batchId) {
    return `dataforge-batch-${format.toLowerCase()}-${ts}.zip`;
  }
  return `dataforge-export-${format.toLowerCase()}-${ts}.zip`;
}

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId") ?? undefined;
  const batchId = req.nextUrl.searchParams.get("batchId") ?? undefined;
  const formatParam = req.nextUrl.searchParams.get("format") ?? "JSON";
  const format = (["CSV", "JSON", "PARQUET", "COCO"].includes(formatParam)
    ? formatParam
    : "JSON") as ExportFormat;

  const files = await resolveExportFiles(session.user.id, { fileId, batchId });
  if (files.length === 0) {
    return NextResponse.json({ error: "No files to export" }, { status: 400 });
  }

  const zipBuffer = await buildExportZip(
    files,
    format,
    session.user.email ?? "unknown"
  );

  const filename = zipFilename(files, format, { fileId, batchId });
  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Expose-Headers": "Content-Disposition",
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    format?: ExportFormat;
    destination?: "kaggle" | "github";
    title?: string;
    fileId?: string;
    batchId?: string;
    repo?: string;
    tag?: string;
  };

  const files = await resolveExportFiles(session.user.id, {
    fileId: body.fileId,
    batchId: body.batchId,
  });
  if (files.length === 0) {
    return NextResponse.json({ error: "No files to export" }, { status: 400 });
  }

  const format = body.format ?? "JSON";
  const zipBuffer = await buildExportZip(
    files,
    format,
    session.user.email ?? "unknown"
  );

  const defaultTitle =
    body.fileId && files[0]
      ? `DataForge: ${files[0].originalName}`
      : body.batchId
        ? `DataForge batch ${body.batchId.slice(0, 8)}`
        : `DataForge export ${new Date().toISOString().slice(0, 10)}`;

  if (body.destination === "kaggle") {
    const title = body.title?.trim() || defaultTitle;
    try {
      const result = await pushToKaggle(session.user.id, zipBuffer, title);
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kaggle upload failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (body.destination === "github") {
    const repo = body.repo?.trim();
    if (!repo) {
      return NextResponse.json({ error: "GitHub repo (owner/name) is required" }, { status: 400 });
    }
    const title = body.title?.trim() || defaultTitle;
    try {
      const result = await pushToGitHub(
        session.user.id,
        zipBuffer,
        repo,
        title,
        body.tag?.trim()
      );
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "GitHub upload failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const filename = zipFilename(files, format, {
    fileId: body.fileId,
    batchId: body.batchId,
  });
  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Expose-Headers": "Content-Disposition",
    },
  });
}
