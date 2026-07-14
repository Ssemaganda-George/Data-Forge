import { NextRequest, NextResponse } from "next/server";
import { requireServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireServerSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await requireServerSession();
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : null;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters." },
      { status: 400 }
    );
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}
