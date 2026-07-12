import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildDatacardJson,
  buildCleanedDataText,
  buildExportZip,
  type ExportFileRow,
} from "@/lib/export-builder";
import JSZip from "jszip";

async function getUserExportFiles(userId: string, fileId?: string): Promise<ExportFileRow[]> {
  return db.fileRecord.findMany({
    where: {
      batch: { project: { userId } },
      ...(fileId ? { id: fileId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

function safeFilename(name: string) {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 80) || "export";
}

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId") ?? undefined;
  const files = await getUserExportFiles(session.user.id, fileId);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files to export" }, { status: 400 });
  }

  const ts = Date.now();
  const datacard = buildDatacardJson(files, session.user.email ?? "unknown");
  const cleanedDataText = buildCleanedDataText(files);

  const zip = new JSZip();
  zip.file("datacard.json", JSON.stringify(datacard, null, 2));
  zip.file("cleaned-data.txt", cleanedDataText);

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const base = fileId ? safeFilename(files[0].originalName) : "dataforge-export";
  const filename = `${base}-${ts}.zip`;
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
    format?: "CSV" | "JSON" | "PARQUET" | "COCO";
    destination?: "kaggle";
    title?: string;
    fileId?: string;
  };

  const files = await getUserExportFiles(session.user.id, body.fileId);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files to export" }, { status: 400 });
  }

  const format = body.format ?? "JSON";
  const zipBuffer = await buildExportZip(
    files,
    format,
    session.user.email ?? "unknown"
  );

  if (body.destination === "kaggle") {
    const conn = await db.platformConnection.findUnique({
      where: {
        userId_platform: { userId: session.user.id, platform: "KAGGLE" },
      },
    });
    if (!conn) {
      return NextResponse.json(
        { error: "Connect Kaggle under Settings → Integrations first" },
        { status: 400 }
      );
    }

    const { decryptSecret } = await import("@/lib/secret-box");
    const { pushZipToKaggle, slugifyDatasetTitle } = await import("@/lib/kaggle-client");
    const title =
      body.title?.trim() ||
      (body.fileId && files[0]
        ? `DataForge: ${files[0].originalName}`
        : `DataForge export ${new Date().toISOString().slice(0, 10)}`);
    const slug = `${slugifyDatasetTitle(title)}-${Date.now().toString(36)}`;

    try {
      const result = await pushZipToKaggle(
        { username: conn.username, key: decryptSecret(conn.credential) },
        zipBuffer,
        title,
        slug
      );
      return NextResponse.json({
        ok: true,
        platform: "kaggle",
        title,
        slug,
        url: result.url ?? `https://www.kaggle.com/datasets/${conn.username}/${slug}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kaggle upload failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const ts = Date.now();
  const filename = `dataforge-export-${format.toLowerCase()}-${ts}.zip`;
  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Access-Control-Expose-Headers": "Content-Disposition",
    },
  });
}
