import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendTrialReportEmail } from "@/lib/trial/email";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  trialId: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "A valid trial id and email are required." },
        { status: 400 }
      );
    }

    const { trialId, email } = parsed.data;
    const sent = await sendTrialReportEmail(trialId, email);
    if (!sent) {
      return NextResponse.json(
        { error: "Trial result expired or not found. Please clean the file again." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[trial/send-report] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
