"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconArrowLeft, IconMicrophone, IconTable, IconLayoutGrid } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    id: "LANGUAGE_VOICE",
    label: "Language & voice",
    description:
      "Transcribe audio, detect language, deduplicate speech datasets.",
    icon: IconMicrophone,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "BUSINESS_DATA",
    label: "Business data",
    description: "OCR documents, clean spreadsheets, redact PII.",
    icon: IconTable,
    color: "bg-green-50 text-green-600",
  },
  {
    id: "GENERAL",
    label: "General",
    description: "Mixed file types — apply any combination of cleaning steps.",
    icon: IconLayoutGrid,
    color: "bg-purple-50 text-purple-600",
  },
] as const;

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [module, setModule] = useState<"LANGUAGE_VOICE" | "BUSINESS_DATA" | "GENERAL">(
    "GENERAL"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, module }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = (await res.json()) as { id: string };
      router.push(`/projects/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-6"
      >
        <IconArrowLeft size={14} />
        All projects
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        Create project
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Projects group your uploads into a single cleaning pipeline.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project name"
          placeholder="e.g. Customer support Q3 2026"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={error}
          autoFocus
        />

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Pipeline type
          </p>
          <div className="space-y-2">
            {MODULES.map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  module === m.id
                    ? "border-brand-400 bg-brand-50/40"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <input
                  type="radio"
                  name="module"
                  value={m.id}
                  checked={module === m.id}
                  onChange={() => setModule(m.id)}
                  className="mt-0.5 text-brand-600"
                />
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", m.color)}>
                  <m.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" loading={loading}>
          Create project
        </Button>
      </form>
    </div>
  );
}
