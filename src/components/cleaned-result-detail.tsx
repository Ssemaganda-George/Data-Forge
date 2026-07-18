"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
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

        {expandedType === "AI_ANALYSIS" ? (
          <AiAnalysisPanel content={cleanedContent} />
        ) : expandedType ? (
          <ActionDetailPanel
            type={expandedType}
            description={
              actions.find((a) => a.type === expandedType)?.description ?? ""
            }
          />
        ) : null}
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
      {expandedType === "AI_ANALYSIS" ? (
        <AiAnalysisPanel content={cleanedContent} />
      ) : expandedType ? (
        <ActionDetailPanel
          type={expandedType}
          description={
            actions.find((a) => a.type === expandedType)?.description ?? ""
          }
        />
      ) : null}
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
