import { NextResponse } from "next/server";
import { getServerSession, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

/** Called by the sidebar sign-out button before redirecting to /login */
export async function POST() {
  const session = await getServerSession();
  if (session) {
    await signOut();
  }
  return NextResponse.json({ ok: true });
}
