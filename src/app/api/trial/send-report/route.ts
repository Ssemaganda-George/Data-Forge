import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTrialResult } from "@/lib/trial/store";
import { extractAiReport } from "@/lib/trial/report";
import { sendEmail, emailFrom } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  trialId: z.string().min(1),
  email: z.string().email(),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
    const trial = getTrialResult(trialId);
    if (!trial) {
      return NextResponse.json(
        { error: "Trial result expired or not found. Please clean the file again." },
        { status: 404 }
      );
    }

    const report = extractAiReport(trial.cleanedContent);

    const subject = `Your YoDataSet cleaning report: ${trial.originalName}`;
    const text = buildTextReport(trial.originalName, trial, report);

    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;color:#0B2E2C">
        <h2 style="color:#028090">Your cleaning report is ready</h2>
        <p><strong>File:</strong> ${escapeHtml(trial.originalName)}</p>
        <p><strong>Credits used:</strong> ${trial.creditsUsed}</p>
        <p><strong>Confidence score:</strong> ${Math.round(trial.confidenceScore * 100)}%</p>
        ${report ? `<pre style="white-space:pre-wrap;background:#F7FAF9;border:1px solid #E5E7EB;border-radius:12px;padding:16px;font-size:13px;line-height:1.5">${escapeHtml(report)}</pre>` : ""}
        <p style="margin-top:16px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/signup?trial=${trialId}"
             style="background:#028090;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">
            Create a free account to download
          </a>
        </p>
        <p style="font-size:12px;color:#4A6461">
          This also confirms we can reach you at this address. We'll only email you about your YoDataSet account.
        </p>
      </div>
    `;

    await sendEmail({ to: email, subject, text, html });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[trial/send-report] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

function buildTextReport(
  name: string,
  trial: { creditsUsed: number; confidenceScore: number; cleanedContent: string },
  report: string | null
): string {
  const lines = [
    "YoDataSet — your cleaning report",
    "===============================",
    `File: ${name}`,
    `Credits used: ${trial.creditsUsed}`,
    `Confidence score: ${Math.round(trial.confidenceScore * 100)}%`,
    "",
  ];
  if (report) {
    lines.push("AI ANALYSIS", "-----------", report, "");
  }
  lines.push(
    "Create a free account to download your cleaned dataset:",
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://yodataset.com"}/signup`
  );
  return lines.join("\n");
}
