/**
 * Extract a human-readable "AI report" from a file's cleaned content so it can
 * be shown on its own — in the trial widget UI or emailed as a standalone
 * report. Returns null when no AI analysis is present.
 *
 * Two content shapes are supported:
 *
 * 1. Text documents (PDF / DOCX / image) embed a divider-delimited block:
 *      ═══...═══
 *      AI ANALYSIS
 *      ═══...═══
 *      <actual report>
 *      ═══...═══
 *
 * 2. Spreadsheets (CSV / XLSX) store structured insights as JSON under
 *    `ai_insights`. We render that into the same header-based text format the
 *    report UI already knows how to parse (Summary, Tags, Key Entities, …).
 */
export function extractAiReport(content: string): string | null {
  const fromVoice = extractVoiceReport(content);
  if (fromVoice) return fromVoice;

  const fromDivider = extractDividerBlock(content);
  if (fromDivider) return fromDivider;

  const fromSpreadsheet = extractSpreadsheetInsights(content);
  if (fromSpreadsheet) return fromSpreadsheet;

  return null;
}

/**
 * Voice payloads (audio/video) store the AI report as a divider block inside
 * the JSON `aiReport` field. Pull it out and reuse the divider extractor.
 */
function extractVoiceReport(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as {
      kind?: string;
      aiReport?: string;
    };
    if (parsed.kind === "voice" && parsed.aiReport) {
      return (
        extractDividerBlock(parsed.aiReport) ??
        (parsed.aiReport.trim() || null)
      );
    }
  } catch {
    return null;
  }
  return null;
}

function extractDividerBlock(content: string): string | null {
  const marker = "AI ANALYSIS";
  const start = content.indexOf(marker);
  if (start === -1) return null;

  // Move past the marker line and the divider line that immediately follows it.
  const afterMarker = content.indexOf("\n", start);
  const rest = afterMarker === -1 ? "" : content.slice(afterMarker + 1);

  // Skip the first divider line so we don't capture empty text.
  const firstDivider = rest.search(/═{3,}/);
  if (firstDivider === -1) return null;
  const afterFirstDivider = rest.slice(firstDivider);
  // Trim the divider line itself and any leading whitespace.
  const afterDivider = afterFirstDivider.replace(/^═{3,}\s*/, "");

  // Cut at the next divider line (end of the AI block).
  const endDivider = afterDivider.search(/═{3,}/);
  const block = endDivider === -1 ? afterDivider : afterDivider.slice(0, endDivider);

  return block.trim() || null;
}

interface SpreadsheetAiInsights {
  dataset_purpose?: string;
  column_descriptions?: Record<string, string>;
  quality_insights?: string[];
  anomalies?: Array<{
    column?: string;
    issue?: string;
    example?: string;
    suggestion?: string;
  }>;
  normalization_suggestions?: string[];
  ml_readiness_score?: number | string;
  error?: string;
}

function extractSpreadsheetInsights(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;

  let parsed: { ai_insights?: SpreadsheetAiInsights };
  try {
    parsed = JSON.parse(trimmed) as { ai_insights?: SpreadsheetAiInsights };
  } catch {
    return null;
  }

  const ai = parsed.ai_insights;
  if (!ai || ai.error) return null;

  const sections: string[] = [];

  // "Document Type" / "Summary" headers reuse the report UI's known parsing.
  sections.push(`Document Type: Structured dataset`);

  if (ai.dataset_purpose) {
    sections.push(`Summary:\n${ai.dataset_purpose}`);
  }

  if (ai.quality_insights && ai.quality_insights.length > 0) {
    sections.push(
      `Quality Insights:\n` +
        ai.quality_insights.map((s) => `• ${s}`).join("\n")
    );
  }

  if (ai.anomalies && ai.anomalies.length > 0) {
    const lines = ai.anomalies.map((a) => {
      const col = a.column ? `[${a.column}] ` : "";
      const example = a.example ? ` (e.g. ${a.example})` : "";
      const suggestion = a.suggestion ? ` → ${a.suggestion}` : "";
      return `• ${col}${a.issue ?? ""}${example}${suggestion}`;
    });
    sections.push(`Anomalies:\n${lines.join("\n")}`);
  }

  if (ai.normalization_suggestions && ai.normalization_suggestions.length > 0) {
    sections.push(
      `Normalization Suggestions:\n` +
        ai.normalization_suggestions.map((s) => `• ${s}`).join("\n")
    );
  }

  if (ai.ml_readiness_score !== undefined && ai.ml_readiness_score !== null) {
    sections.push(`ML Readiness Score: ${ai.ml_readiness_score}`);
  }

  const block = sections.join("\n\n").trim();
  return block || null;
}
