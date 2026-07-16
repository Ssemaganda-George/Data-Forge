"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Check, Loader2, Sparkles, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  parseVoiceCleanedContent,
  type CleaningActionSummary,
} from "@/lib/project-ui";
import { extractAiReport } from "@/lib/trial/report";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

interface TrialResultData {
  trialId: string;
  originalName: string;
  fileType: string;
  creditsUsed: number;
  cleaningActions: CleaningActionSummary[];
  confidenceScore: number;
  flaggedForReview: boolean;
  cleanedContent: string;
  signupUrl: string;
}

type Phase = "idle" | "uploading" | "done" | "error";

export function TrialWidget() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrialResultData | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (!f) return;
      setError("");
      setResult(null);

      const typeOk = Object.keys(ACCEPT).includes(f.type);
      if (!typeOk) {
        setError(
          "Unsupported file. Use PDF, JPG, PNG, CSV, or XLSX (audio is excluded from the trial)."
        );
        return;
      }
      if (f.size > MAX_BYTES) {
        setError("File is larger than the 5 MB trial limit.");
        return;
      }
      setFile(f);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    maxSize: MAX_BYTES,
  });

  async function cleanNow() {
    if (!file) return;
    setPhase("uploading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Honeypot field — must stay empty for real users.
      formData.append("company_website", "");

      const res = await fetch("/api/trial/clean", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "rate_limited" || data.code === "budget_exceeded") {
          setRemaining(0);
        }
        throw new Error(data.error ?? "Cleaning failed");
      }

      setResult(data as TrialResultData);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cleaning failed");
      setPhase("error");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError("");
    setPhase("idle");
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-[#028090]" />
        <h3 className="text-base font-semibold text-[#0B2E2C]">
          Try it free — no account needed
        </h3>
      </div>
      <p className="text-sm text-[#4A6461] mb-5">
        Drop one file and watch it get cleaned. Then create a free account to
        download your dataset.
      </p>

      {phase === "idle" && (
        <>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-[#028090] bg-[#E6F4F2]"
                : "border-gray-200 hover:border-gray-300 hover:bg-[#F7FAF9]"
            )}
          >
            <input {...getInputProps()} />
            <Upload
              size={30}
              className={cn("mx-auto mb-3", isDragActive ? "text-[#028090]" : "text-gray-400")}
              stroke="1.5"
            />
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? "Drop your file here" : "Drag & drop a file to clean"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PDF, JPG, PNG, CSV, XLSX · up to 5 MB · one file
            </p>
          </div>
          {file && (
            <div className="mt-4 flex items-center justify-between bg-[#F7FAF9] border border-[#E5E7EB] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Check size={16} className="text-green-600 shrink-0" />
                <span className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
                <button
                  onClick={cleanNow}
                  className="text-sm font-medium text-white bg-[#028090] rounded-md px-3 py-1.5 hover:bg-[#026c78] transition-colors"
                >
                  Clean it
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {phase === "uploading" && (
        <div className="py-10 text-center">
          <Loader2 size={28} className="mx-auto mb-3 animate-spin text-[#028090]" />
          <p className="text-sm text-[#4A6461]">Cleaning your file…</p>
        </div>
      )}

      {error && (phase === "error" || phase === "idle") && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {phase === "done" && result && (
        <div
          className="space-y-4 select-none [user-select:none]"
          onCopy={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg py-2">
            <Check size={16} /> Cleaned in seconds — here&apos;s your result
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Cleaning actions applied
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.cleaningActions.map((a) => {
                const active = expandedType === a.type;
                return (
                  <button
                    key={`${a.type}-${a.description}`}
                    type="button"
                    onClick={() => setExpandedType(active ? null : a.type)}
                    title={a.description || "Click for details"}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer hover:bg-[#E6F4F2]",
                      active
                        ? "bg-[#028090] text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <Check size={11} className={active ? "text-white" : "text-green-600"} />
                    {a.type}
                  </button>
                );
              })}
            </div>

            {expandedType && expandedType === "AI_ANALYSIS" ? (
              <AiAnalysisPanel content={result.cleanedContent} />
            ) : expandedType ? (
              <ActionDetailPanel type={expandedType} description={result.cleaningActions.find((a) => a.type === expandedType)?.description ?? ""} />
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Cleaned output
            </p>
            <TrialCleanedView
              content={result.cleanedContent}
              score={result.confidenceScore}
            />
          </div>

          {/* Signup gate — blur the export, keep the preview clear */}
          <div className="relative rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 bg-[#F7FAF9]">
              <p className="text-sm font-medium text-[#0B2E2C]">
                Create a free account to download your clean dataset.
              </p>
              <p className="mt-1 text-xs text-[#4A6461]">
                Your cleaned file is ready — sign up and it lands in your first
                project automatically.
              </p>

              <p className="mt-3 text-[11px] text-[#4A6461]">
                We&apos;ll email your AI report to the address you sign up with.
              </p>
            </div>
            <div className="relative px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Export as CSV / JSON</span>
                <button
                  disabled
                  className="text-sm font-medium text-white bg-[#028090]/60 rounded-md px-4 py-2 cursor-not-allowed"
                >
                  Download
                </button>
              </div>
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-b-xl" />
            </div>
            <div className="relative px-5 pb-4 text-center">
              <a
                href={result.signupUrl}
                className="inline-block text-sm font-medium text-white bg-[#028090] rounded-md px-5 py-2.5 hover:bg-[#026c78] transition-colors"
              >
                Sign up free to download
              </a>
            </div>
          </div>

          <button
            onClick={reset}
            className="text-xs text-[#4A6461] hover:text-[#0B2E2C] underline underline-offset-2"
          >
            Clean another file
          </button>
        </div>
      )}

      {remaining === 0 && (
        <p className="mt-3 text-sm text-[#4A6461]">
          Hit the trial limit?{" "}
          <a href="/signup" className="text-[#028090] hover:underline">
            Create a free account
          </a>{" "}
          for unlimited processing.
        </p>
      )}
    </div>
  );
}

function ActionDetailPanel({ type, description }: { type: string; description: string }) {
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

function TrialCleanedView({
  content,
  score,
}: {
  content: string;
  score: number;
}) {
  const voice = parseVoiceCleanedContent(content);
  return (
    <div>
      {typeof score === "number" && (
        <p className="text-xs text-gray-400 mb-2">
          Confidence score: {Math.round(score * 100)}%
        </p>
      )}
      <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700 bg-[#F7FAF9] border border-[#E5E7EB] rounded-lg p-3 max-h-64 overflow-y-auto leading-relaxed select-none [user-select:none]">
        {voice ? voice.transcript || content : content}
      </pre>
    </div>
  );
}

function AiAnalysisPanel({ content }: { content: string }) {
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

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^Document Type:/i.test(trimmed)) {
      current = { title: "Document Type", body: [trimmed.replace(/^Document Type:\s*/i, "")] };
      sections.push(current);
    } else if (/^Tags:/i.test(trimmed)) {
      current = { title: "Tags", body: [trimmed.replace(/^Tags:\s*/i, "")] };
      sections.push(current);
    } else if (/^Summary:/i.test(trimmed)) {
      current = { title: "Summary", body: [] };
      sections.push(current);
      if (trimmed.replace(/^Summary:\s*/i, "").trim()) current.body.push(trimmed.replace(/^Summary:\s*/i, ""));
    } else if (/^Key Entities:/i.test(trimmed)) {
      current = { title: "Key Entities", body: [] };
      sections.push(current);
    } else if (/^Q&A Training Pairs/i.test(trimmed)) {
      current = { title: "Q&A Training Pairs", body: [] };
      sections.push(current);
    } else if (trimmed && current) {
      current.body.push(trimmed);
    }
  }

  const qaPairs = (sections.find((s) => s.title === "Q&A Training Pairs")?.body ?? [])
    .join("\n")
    .split(/(?=Q\d+:)/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] p-4 space-y-3 select-none [user-select:none]">
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
          <p className="text-xs font-semibold text-gray-700 mb-1">Q&A Training Pairs</p>
          <div className="space-y-2">
            {qaPairs.map((qa, i) => {
              const q = (qa.match(/^Q\d+:\s*([\s\S]*)/)?.[1] ?? qa)
                .replace(/A\d+:\s*[\s\S]*$/, "")
                .trim();
              const a = qa.match(/A\d+:\s*([\s\S]*)/)?.[1] ?? "";
              return (
                <div key={i} className="rounded-md bg-white border border-[#E5E7EB] p-2.5">
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
