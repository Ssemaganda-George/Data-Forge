import { extractAiReport } from "@/lib/trial/report";
import type { DatasetFilePreview } from "@/lib/project-queries";

export interface DatasetAnalysis {
  /** True when a real LLM synthesis ran (and is therefore dataset-specific). */
  synthesized: boolean;
  /** Short overview of the whole dataset. */
  overview: string;
  /** Combined topic tags across the dataset. */
  tags: string[];
  /** Distinct organizations / people / locations / dates gathered from files. */
  entities: {
    organizations: string[];
    people: string[];
    locations: string[];
    dates: string[];
  };
  /** Dataset-level question/answer pairs suitable for RAG / fine-tuning. */
  qaPairs: { question: string; answer: string }[];
  /** Per-file AI summary snippets (always available as a fallback). */
  perFile: { name: string; fileType: string; report: string | null }[];
  /** Why synthesis was skipped (e.g. missing key, too little content). */
  note?: string;
}

function uniq(...lists: (string[] | undefined)[]) {
  const seen = new Set<string>();
  for (const list of lists) {
    for (const item of list ?? []) {
      const v = item.trim();
      if (v) seen.add(v);
    }
  }
  return Array.from(seen).slice(0, 24);
}

function parseSections(report: string) {
  const lower = report.toLowerCase();
  const out = {
    tags: [] as string[],
    organizations: [] as string[],
    people: [] as string[],
    locations: [] as string[],
    dates: [] as string[],
    qaPairs: [] as { question: string; answer: string }[],
  };

  const grab = (heading: string): string | null => {
    const idx = lower.indexOf(heading.toLowerCase());
    if (idx === -1) return null;
    const after = report.slice(idx + heading.length);
    const next = after.search(/\n[A-Z][A-Za-z][^\n]*:/);
    return (next === -1 ? after : after.slice(0, next)).trim();
  };

  const tagsRaw = grab("Tags:");
  if (tagsRaw) {
    out.tags = tagsRaw
      .split(/[,\n]/)
      .map((t) => t.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  const orgs = grab("Organizations:");
  if (orgs) out.organizations = orgs.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const people = grab("People:");
  if (people) out.people = people.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const locs = grab("Locations:");
  if (locs) out.locations = locs.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const dates = grab("Dates:");
  if (dates) out.dates = dates.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  const qa = grab("Q&A Pairs:") ?? grab("QA Pairs:");
  if (qa) {
    const re = /Q:\s*([\s\S]*?)\s*A:\s*([\s\S]*?)(?=\nQ:|$)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(qa))) {
      const question = m[1].trim();
      const answer = m[2].trim();
      if (question && answer) out.qaPairs.push({ question, answer });
    }
  }

  return out;
}

/**
 * Build a dataset-level AI analysis from per-file reports.
 *
 * When GROQ_API_KEY is configured we ask the LLM to synthesize one coherent
 * analysis across all files. Otherwise we merge the per-file reports into a
 * best-effort aggregated view so the section is never empty.
 */
export async function analyzeDataset(
  files: DatasetFilePreview[]
): Promise<DatasetAnalysis> {
  const perFile = files.map((f) => ({
    name: f.originalName,
    fileType: f.fileType,
    report: f.cleanedContent ? extractAiReport(f.cleanedContent) : null,
  }));

  const withReports = perFile.filter((f) => f.report);

  if (withReports.length === 0) {
    return {
      synthesized: false,
      overview:
        "No AI analysis is available for the files in this dataset yet. Run the AI analysis pipeline (requires GROQ_API_KEY) to generate dataset-level insights.",
      tags: [],
      entities: { organizations: [], people: [], locations: [], dates: [] },
      qaPairs: [],
      perFile,
      note: "No per-file AI reports were found.",
    };
  }

  // ── Fallback: aggregate per-file reports locally ──
  if (!process.env.GROQ_API_KEY) {
    const merged = { tags: [] as string[], orgs: [] as string[], people: [] as string[], locs: [] as string[], dates: [] as string[], qa: [] as { question: string; answer: string }[] };
    for (const f of withReports) {
      const s = parseSections(f.report as string);
      merged.tags.push(...s.tags);
      merged.orgs.push(...s.organizations);
      merged.people.push(...s.people);
      merged.locs.push(...s.locations);
      merged.dates.push(...s.dates);
      merged.qa.push(...s.qaPairs);
    }

    const overview =
      `This dataset contains ${files.length} file${files.length === 1 ? "" : "s"}` +
      ` (${withReports.length} with AI analysis). ` +
      (merged.tags.length
        ? `Common topics include ${uniq(merged.tags).slice(0, 6).join(", ")}.`
        : "Topics vary across the files.");

    return {
      synthesized: false,
      overview,
      tags: uniq(merged.tags),
      entities: {
        organizations: uniq(merged.orgs),
        people: uniq(merged.people),
        locations: uniq(merged.locs),
        dates: uniq(merged.dates),
      },
      qaPairs: merged.qa.slice(0, 8),
      perFile,
      note: "Aggregated from per-file reports. Set GROQ_API_KEY to synthesize a single cross-file analysis.",
    };
  }

  // ── Synthesize with Groq ──
  const corpus = withReports
    .map(
      (f, i) =>
        `FILE ${i + 1} (${f.name}):\n${(f.report as string).slice(0, 4000)}`
    )
    .join("\n\n---\n\n")
    .slice(0, 24000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `You are a dataset intelligence system. Below are the AI analyses of each file in a cleaned dataset. Synthesize a single cross-file analysis of the WHOLE dataset and return a JSON object with EXACTLY these keys:

"overview": 4-6 sentence summary of what the dataset as a whole contains, its scope, and likely use cases
"tags": 6-10 topic tags describing the dataset
"entities": { "organizations": [...], "people": [...], "locations": [...], "dates": [...] }
"qa_pairs": array of exactly 8 question-answer pairs drawn across the whole dataset, each {"question": "...", "answer": "..."}, suitable for ML fine-tuning or RAG

ANALYSES:
${corpus}`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const parsed = JSON.parse(json.choices[0].message.content) as {
      overview?: string;
      tags?: string[];
      entities?: {
        organizations?: string[];
        people?: string[];
        locations?: string[];
        dates?: string[];
      };
      qa_pairs?: { question: string; answer: string }[];
    };

    return {
      synthesized: true,
      overview: parsed.overview ?? "No overview generated.",
      tags: parsed.tags ?? [],
      entities: {
        organizations: parsed.entities?.organizations ?? [],
        people: parsed.entities?.people ?? [],
        locations: parsed.entities?.locations ?? [],
        dates: parsed.entities?.dates ?? [],
      },
      qaPairs: parsed.qa_pairs ?? [],
      perFile,
    };
  } catch {
    return {
      synthesized: false,
      overview:
        "Could not synthesize a cross-file analysis (AI service unavailable). Showing the per-file reports below instead.",
      tags: [],
      entities: { organizations: [], people: [], locations: [], dates: [] },
      qaPairs: [],
      perFile,
      note: "Groq synthesis failed; falling back to per-file reports.",
    };
  }
}
