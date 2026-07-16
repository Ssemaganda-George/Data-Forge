// =============================================================================
// PROJECTS ROUTE
// =============================================================================
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { importTrialIntoNewAccount } from "@/lib/trial/import";

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  module: z.enum(["LANGUAGE_VOICE", "BUSINESS_DATA", "GENERAL"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
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
  const session = await authenticateRequest(req);
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

  // Carry a free-trial file into the user's first project (no re-upload).
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { trialCarryOverId: true, _count: { select: { projects: true } } },
  });
  if (user?.trialCarryOverId && user._count.projects <= 1) {
    try {
      await importTrialIntoNewAccount(session.user.id, user.trialCarryOverId);
      await db.user.update({
        where: { id: session.user.id },
        data: { trialCarryOverId: null },
      });
    } catch (err) {
      console.error("[projects POST] trial import error:", err);
    }
  }

  return NextResponse.json({ id: project.id }, { status: 201 });
}
