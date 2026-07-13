import { NextRequest, NextResponse } from "next/server";
import { signUpWithPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const result = await signUpWithPassword(email, password, name);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.needsEmailConfirmation) {
      return NextResponse.json({ needsEmailConfirmation: true });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
