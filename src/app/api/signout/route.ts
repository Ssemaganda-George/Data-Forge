import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/** Called by the sidebar sign-out button before redirecting to /login */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (session) {
    await db.fileRecord.deleteMany({
      where: {
        batch: { project: { userId: session.user.id } },
      },
    });
  }
  return NextResponse.json({ ok: true });
}
