import { NextRequest, NextResponse } from "next/server";
import { signInWithPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const result = await signInWithPassword(email, password);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json({ 
      ok: true, 
      role: result.role 
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
