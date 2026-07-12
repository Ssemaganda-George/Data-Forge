// =============================================================================
// PROJECTS ROUTE — DB MODE only
//
// This route requires a live database. It is called by /projects/new (create)
// and by pages that list real projects.
//
// While in TEMP MODE the "Create project" form will get a 500 — that is
// expected. Real project management resumes once DB is connected.
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  module: z.enum(["LANGUAGE_VOICE", "BUSINESS_DATA", "GENERAL"]).optional(),
});

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      batches: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, _count: { select: { files: true } } },
      },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const project = await db.project.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      module: parsed.data.module ?? "GENERAL",
      batches: {
        create: { status: "PENDING" },
      },
    },
    include: { batches: { select: { id: true } } },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
