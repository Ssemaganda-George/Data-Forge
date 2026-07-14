import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const datasets = await db.dataset.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      fileCount: true,
      totalSizeBytes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(datasets);
}

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : null;

  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const dataset = await db.dataset.create({
    data: {
      id: crypto.randomUUID(),
      userId: session.user.id,
      name,
      description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      fileCount: true,
      totalSizeBytes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(dataset, { status: 201 });
}
