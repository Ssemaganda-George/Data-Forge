/**
 * Extract the "AI ANALYSIS" block from cleaned content (delimited by the
 * ═══ divider lines around the marker) so it can be shown on its own — in the
 * trial widget UI or emailed as a standalone report. Returns null when no AI
 * block is present.
 *
 * Layout in cleaned content:
 *   ═══...═══
 *   AI ANALYSIS
 *   ═══...═══
 *   <actual report>
 *   ═══...═══
 */
export function extractAiReport(content: string): string | null {
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

