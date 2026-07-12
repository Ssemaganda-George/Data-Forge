import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { db } from "@/lib/db"; // ← DB MODE: uncomment to fetch real counts
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/workspace-section";
import {
  IconFiles,
  IconDatabase,
  IconStar,
  IconCloud,
  IconMicrophone,
  IconTable,
  IconPlus,
  IconArrowRight,
  IconChevronRight,
} from "@tabler/icons-react";
import { formatBytes } from "@/lib/utils";
import type { BatchStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Dashboard" };

// ── TEMP MODE: placeholder stats ─────────────────────────────────────────────
// DB MODE: replace with real queries, e.g.:
//   const filesProcessed = await db.fileRecord.count({ where: { batch: { project: { userId } } } });
//   const storageUsed   = await db.usageLog.aggregate({ _sum: { gbProcessed: true }, where: { userId } });
const PLACEHOLDER_STATS = {
  filesProcessed: 12_480,
  datasetsReady: 47,
  avgQualityScore: 94,
  storageUsedBytes: 38_400_000_000,
};

const PLACEHOLDER_PROJECTS = [
  {
    id: "proj_1",
    name: "Customer support transcripts",
    module: "LANGUAGE_VOICE" as const,
    status: "COMPLETE" as BatchStatus,
    fileCount: 320,
    updatedAt: "2 hours ago",
  },
  {
    id: "proj_2",
    name: "Invoice OCR dataset",
    module: "BUSINESS_DATA" as const,
    status: "PROCESSING" as BatchStatus,
    fileCount: 85,
    updatedAt: "12 min ago",
  },
  {
    id: "proj_3",
    name: "Product image catalogue",
    module: "GENERAL" as const,
    status: "REVIEW" as BatchStatus,
    fileCount: 1420,
    updatedAt: "Yesterday",
  },
  {
    id: "proj_4",
    name: "Sales call recordings",
    module: "LANGUAGE_VOICE" as const,
    status: "FAILED" as BatchStatus,
    fileCount: 12,
    updatedAt: "3 days ago",
  },
];

function batchStatusToBadge(
  status: BatchStatus
): "processing" | "ready" | "flagged" | "failed" | "pending" {
  const map: Record<BatchStatus, "processing" | "ready" | "flagged" | "failed" | "pending"> = {
    PENDING: "pending",
    PROCESSING: "processing",
    REVIEW: "flagged",
    COMPLETE: "ready",
    FAILED: "failed",
  };
  return map[status];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  // In production, fetch real counts from DB:
  // const projectCount = await db.project.count({ where: { userId: session?.user.id } });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Good morning, {firstName}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Here&apos;s what&apos;s happening across your datasets.
          </p>
        </div>
        <Link href="/projects/new">
          <Button variant="primary">
            <IconPlus size={16} />
            Create project
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Files processed"
            value={PLACEHOLDER_STATS.filesProcessed}
            icon={<IconFiles size={18} stroke={1.5} />}
            trend={{ value: "12%", positive: true }}
          />
          <StatCard
            label="Datasets ready"
            value={PLACEHOLDER_STATS.datasetsReady}
            icon={<IconDatabase size={18} stroke={1.5} />}
            trend={{ value: "3", positive: true }}
          />
          <StatCard
            label="Avg quality score"
            value={`${PLACEHOLDER_STATS.avgQualityScore}%`}
            icon={<IconStar size={18} stroke={1.5} />}
          />
          <StatCard
            label="Storage used"
            value={formatBytes(PLACEHOLDER_STATS.storageUsedBytes)}
            icon={<IconCloud size={18} stroke={1.5} />}
          />
        </div>
      </section>

      {/* Workspace — upload, clean, download */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Clean files
        </h2>
        <WorkspaceSection />
      </section>

      {/* Template cards */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Start from a template
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/projects/new?module=LANGUAGE_VOICE">
            <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <IconMicrophone size={20} className="text-blue-600" stroke={1.5} />
                </div>
                <IconArrowRight
                  size={16}
                  className="text-gray-400 group-hover:text-brand-600 transition-colors"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Language and voice studio
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Transcribe audio, tag language, and deduplicate speech datasets
                for model training.
              </p>
            </div>
          </Link>
          <Link href="/projects/new?module=BUSINESS_DATA">
            <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                  <IconTable size={20} className="text-green-600" stroke={1.5} />
                </div>
                <IconArrowRight
                  size={16}
                  className="text-gray-400 group-hover:text-brand-600 transition-colors"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Business data cleaner
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                OCR invoices and PDFs, clean spreadsheets, redact PII, and
                export structured records.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent projects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent projects
          </h2>
          <Link
            href="/projects"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1"
          >
            View all <IconChevronRight size={13} />
          </Link>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">
                  Files
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden lg:table-cell">
                  Updated
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PLACEHOLDER_PROJECTS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell capitalize text-xs">
                    {p.module === "LANGUAGE_VOICE"
                      ? "Language & voice"
                      : p.module === "BUSINESS_DATA"
                      ? "Business data"
                      : "General"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {p.fileCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={batchStatusToBadge(p.status)} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                    {p.updatedAt}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
