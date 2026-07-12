import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import type { BatchStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Projects" };

const PROJECTS = [
  {
    id: "proj_1",
    name: "Customer support transcripts",
    module: "LANGUAGE_VOICE" as const,
    batchStatus: "COMPLETE" as BatchStatus,
    fileCount: 320,
    createdAt: "Jun 28, 2026",
  },
  {
    id: "proj_2",
    name: "Invoice OCR dataset",
    module: "BUSINESS_DATA" as const,
    batchStatus: "PROCESSING" as BatchStatus,
    fileCount: 85,
    createdAt: "Jul 10, 2026",
  },
  {
    id: "proj_3",
    name: "Product image catalogue",
    module: "GENERAL" as const,
    batchStatus: "REVIEW" as BatchStatus,
    fileCount: 1420,
    createdAt: "Jul 8, 2026",
  },
  {
    id: "proj_4",
    name: "Sales call recordings",
    module: "LANGUAGE_VOICE" as const,
    batchStatus: "FAILED" as BatchStatus,
    fileCount: 12,
    createdAt: "Jul 2, 2026",
  },
];

function statusToBadge(
  s: BatchStatus
): "processing" | "ready" | "flagged" | "failed" | "pending" {
  const m: Record<BatchStatus, "processing" | "ready" | "flagged" | "failed" | "pending"> = {
    PENDING: "pending",
    PROCESSING: "processing",
    REVIEW: "flagged",
    COMPLETE: "ready",
    FAILED: "failed",
  };
  return m[s];
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <Link href="/projects/new">
          <Button variant="primary">
            <IconPlus size={16} />
            Create project
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <IconSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search projects…"
          className="input pl-8"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROJECTS.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer h-full">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={statusToBadge(p.batchStatus)} />
                <span className="text-xs text-gray-400">{p.createdAt}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {p.name}
              </h3>
              <p className="text-xs text-gray-400">
                {p.module === "LANGUAGE_VOICE"
                  ? "Language & voice"
                  : p.module === "BUSINESS_DATA"
                  ? "Business data"
                  : "General"}{" "}
                · {p.fileCount.toLocaleString()} files
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
