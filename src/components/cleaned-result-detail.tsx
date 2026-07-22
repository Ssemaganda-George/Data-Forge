"use client";

import { useState } from "react";
import { Check, Sparkles, ClipboardList, Languages, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  parseVoiceCleanedContent,
  type CleaningActionSummary,
} from "@/lib/project-ui";
import { extractAiReport } from "@/lib/trial/report";

/**
 * Shared "cleaned result" detail UI used by both the anonymous trial widget and
 * the logged-in project file list, so both surfaces show identical formatting:
 *
 *   CLEANING ACTIONS APPLIED   (interactive chips)
 *   <AI report / action detail panel when a chip is selected>
 *   CLEANED OUTPUT             (confidence score + content)
 */

export function CleanedResultDetail({
  actions,
  cleanedContent,
  score,
}: {
  actions: CleaningActionSummary[];
  cleanedContent: string;
  score: number | null;
}) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Cleaning actions applied
        </p>
        <CleaningActionChips
          actions={actions}
          expandedType={expandedType}
          onToggle={(type) =>
            setExpandedType((cur) => (cur === type ? null : type))
          }
        />

        {renderActionPanel(expandedType, actions, cleanedContent)}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Cleaned output
        </p>
        <CleanedOutputView content={cleanedContent} score={score} />
      </div>
    </div>
  );
}

/**
 * Shared routing for the expanded action panel. Some action types get a rich,
 * purpose-built panel; everything else falls back to the description.
 */
function renderActionPanel(
  expandedType: string | null,
  actions: CleaningActionSummary[],
  cleanedContent: string
) {
  if (!expandedType) return null;
  const description =
    actions.find((a) => a.type === expandedType)?.description ?? "";

  if (expandedType === "AI_ANALYSIS") {
    return <AiAnalysisPanel content={cleanedContent} />;
  }
  if (expandedType === "DATA_CARD") {
    return <DataCardPanel description={description} />;
  }
  if (expandedType === "SUNBIRD_STT" || expandedType === "AUDIO_TRANSCRIPTION") {
    return (
      <VoiceTextPanel
        cleanedContent={cleanedContent}
        variant="transcript"
        fallbackDescription={description}
      />
    );
  }
  if (expandedType === "SUNBIRD_TRANSLATE") {
    return (
      <VoiceTextPanel
        cleanedContent={cleanedContent}
        variant="translation"
        fallbackDescription={description}
      />
    );
  }
  return <ActionDetailPanel type={expandedType} description={description} />;
}

/**
 * Interactive "Cleaning actions applied" block on its own — chips plus the
 * AI report / action-detail panel, without the "Cleaned output" section. Used
 * where the cleaned output is already shown separately (e.g. voice transcripts).
 */
export function CleaningActionsBlock({
  actions,
  cleanedContent,
}: {
  actions: CleaningActionSummary[];
  cleanedContent: string;
}) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Cleaning actions applied
      </p>
      <CleaningActionChips
        actions={actions}
        expandedType={expandedType}
        onToggle={(type) =>
          setExpandedType((cur) => (cur === type ? null : type))
        }
      />
      {renderActionPanel(expandedType, actions, cleanedContent)}
    </div>
  );
}

export function CleaningActionChips({
  actions,
  expandedType,
  onToggle,
}: {
  actions: CleaningActionSummary[];
  expandedType: string | null;
  onToggle: (type: string) => void;
}) {
  if (actions.length === 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((a) => {
        const active = expandedType === a.type;
        return (
          <button
            key={`${a.type}-${a.description}`}
            type="button"
            onClick={() => onToggle(a.type)}
            title={a.description || "Click for details"}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer hover:bg-[#E6F4F2]",
              active ? "bg-[#028090] text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            <Check size={11} className={active ? "text-white" : "text-green-600"} />
            {a.type}
          </button>
        );
      })}
    </div>
  );
}

export function ActionDetailPanel({
  type,
  description,
}: {
  type: string;
  description: string;
}) {
  return (
    <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] p-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#028090] uppercase tracking-wide">
        <Check size={13} /> {type}
      </div>
      <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
        {description || "No additional details are available for this action."}
      </p>
    </div>
  );
}

/**
 * Voice transcript / translation panel — shows the actual transcribed source
 * text or the English translation from the voice payload when the matching
 * chip (SUNBIRD_STT / AUDIO_TRANSCRIPTION / SUNBIRD_TRANSLATE) is expanded.
 */
export function VoiceTextPanel({
  cleanedContent,
  variant,
  fallbackDescription,
}: {
  cleanedContent: string;
  variant: "transcript" | "translation";
  fallbackDescription: string;
}) {
  const voice = parseVoiceCleanedContent(cleanedContent);

  const isTranslation = variant === "translation";
  const Icon = isTranslation ? Languages : AudioLines;
  const title = isTranslation ? "English translation" : "Source transcript";
  const lang = voice?.sourceLanguage?.toUpperCase();

  const text = isTranslation
    ? voice?.translation?.trim()
    : voice?.transcript?.trim();

  return (
    <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] p-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#028090] uppercase tracking-wide">
        <Icon size={13} /> {title}
        {lang && !isTranslation && (
          <span className="text-gray-400 font-normal normal-case">· {lang}</span>
        )}
      </div>
      {text ? (
        <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-white border border-[#E5E7EB] rounded-lg p-3 max-h-64 overflow-y-auto leading-relaxed">
          {text}
        </pre>
      ) : (
        <p className="text-xs text-gray-500">
          {isTranslation
            ? "No translation was produced for this file."
            : fallbackDescription || "No transcript available for this file."}
        </p>
      )}
    </div>
  );
}

/**
 * Structured "data card" panel — an auditable per-file record of what was
 * cleaned, changed, or flagged, parsed from the DATA_CARD action description
 * (format: "Auditable record · key: value · key: value · …").
 */
export function DataCardPanel({ description }: { description: string }) {
  const segments = description
    .split(" · ")
    .map((s) => s.trim())
    .filter(Boolean);

  const rows: { label: string; value: string }[] = [];
  for (const seg of segments) {
    const idx = seg.indexOf(":");
    if (idx === -1) continue; // skip the "Auditable record" label
    const label = seg.slice(0, idx).trim();
    const value = seg.slice(idx + 1).trim();
    if (label && value) rows.push({ label, value });
  }

  return (
    <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#028090] uppercase tracking-wide">
        <ClipboardList size={13} /> Data card
      </div>
      <p className="text-xs text-gray-500">
        An auditable record of what was cleaned, changed, or flagged on this
        file — and why.
      </p>
      {rows.length > 0 ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col">
              <dt className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                {r.label}
              </dt>
              <dd className="text-xs text-gray-800 break-words">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
          {description || "No data card available for this file."}
        </p>
      )}
    </div>
  );
}

export function CleanedOutputView({
  content,
  score,
}: {
  content: string;
  score: number | null;
}) {
  const voice = parseVoiceCleanedContent(content);
  return (
    <div>
      {typeof score === "number" && (
        <p className="text-xs text-gray-400 mb-2">
          Confidence score: {Math.round(score * 100)}%
        </p>
      )}
      <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-[#F7FAF9] border border-[#E5E7EB] rounded-lg p-3 max-h-64 overflow-y-auto leading-relaxed">
        {voice ? voice.transcript || content : content}
      </pre>
    </div>
  );
}

export function AiAnalysisPanel({ content }: { content: string }) {
  const raw = extractAiReport(content);
  if (!raw) {
    return (
      <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] p-4 text-xs text-gray-500">
        No AI report was generated for this file.
      </div>
    );
  }

  const lines = raw.split("\n");
  const sections: { title: string; body: string[] }[] = [];
  let current: { title: string; body: string[] } | null = null;

  const KNOWN_HEADERS = [
    "Document Type",
    "Tags",
    "Summary",
    "Key Entities",
    "Quality Insights",
    "Anomalies",
    "Normalization Suggestions",
    "ML Readiness Score",
    "Key Details",
    "Expected Output",
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    const headerMatch = trimmed.match(/^([A-Za-z][A-Za-z &/]+):\s*(.*)$/);
    const isKnownHeader =
      headerMatch && KNOWN_HEADERS.includes(headerMatch[1].trim());

    if (/^Q&A Training Pairs/i.test(trimmed)) {
      current = { title: "Q&A Training Pairs", body: [] };
      sections.push(current);
    } else if (isKnownHeader) {
      const title = headerMatch![1].trim();
      const inline = headerMatch![2].trim();
      current = { title, body: inline ? [inline] : [] };
      sections.push(current);
    } else if (trimmed && current) {
      current.body.push(trimmed);
    }
  }

  const qaPairs = (
    sections.find((s) => s.title === "Q&A Training Pairs")?.body ?? []
  )
    .join("\n")
    .split(/(?=Q\d+:)/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#028090] uppercase tracking-wide">
        <Sparkles size={13} /> AI report
      </div>

      {sections
        .filter((s) => s.title !== "Q&A Training Pairs")
        .map((s) => (
          <div key={s.title}>
            <p className="text-xs font-semibold text-gray-700 mb-1">{s.title}</p>
            {s.title === "Tags" ? (
              <div className="flex flex-wrap gap-1.5">
                {s.body
                  .join(" ")
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex px-2 py-0.5 rounded-full text-xs bg-white border border-[#E5E7EB] text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                {s.body.join("\n")}
              </p>
            )}
          </div>
        ))}

      {qaPairs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Q&amp;A Training Pairs
          </p>
          <div className="space-y-2">
            {qaPairs.map((qa, i) => {
              const q = (qa.match(/^Q\d+:\s*([\s\S]*)/)?.[1] ?? qa)
                .replace(/A\d+:\s*[\s\S]*$/, "")
                .trim();
              const a = qa.match(/A\d+:\s*([\s\S]*)/)?.[1] ?? "";
              return (
                <div
                  key={i}
                  className="rounded-md bg-white border border-[#E5E7EB] p-2.5"
                >
                  <p className="text-xs font-medium text-gray-800">{q}</p>
                  <p className="mt-1 text-xs text-gray-600">{a}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
