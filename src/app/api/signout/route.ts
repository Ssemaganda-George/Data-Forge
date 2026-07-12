import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clearFiles } from "@/lib/memory-store";

/** Called by the sidebar sign-out button before redirecting to /login */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (session) clearFiles(session.user.id);
  return NextResponse.json({ ok: true });
}
