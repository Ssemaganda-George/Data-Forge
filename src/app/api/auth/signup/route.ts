import { NextRequest, NextResponse } from "next/server";
import { signUpWithPassword } from "@/lib/auth";
import { sendTrialReportEmail } from "@/lib/trial/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, trialId } = await req.json();

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

    const result = await signUpWithPassword(email, password, name, trialId ?? null);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Email the AI report to the just-created account, using the trial id if
    // the user came from the free trial widget.
    if (trialId) {
      try {
        await sendTrialReportEmail(trialId, email);
      } catch (err) {
        console.error("[signup] failed to send trial report email:", err);
      }
    }

    if (result.needsEmailConfirmation) {
      return NextResponse.json({ needsEmailConfirmation: true });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
