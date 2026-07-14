import type { Metadata } from "next";
import Link from "next/link";
import { requireServerSession } from "@/lib/auth";
import {
  batchStatusToBadge,
  getDashboardStats,
  getProjectsForUser,
  moduleLabel,
} from "@/lib/project-queries";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Greeting } from "@/components/greeting";
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

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireServerSession();
  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const userId = session.user.id;

  const [stats, projects] = await Promise.all([
    getDashboardStats(userId),
    getProjectsForUser(userId),
  ]);

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Greeting firstName={firstName} />
          <p className="mt-0.5 text-sm text-gray-500">
            Here&apos;s what&apos;s happening across your datasets.
          </p>
        </div>
        <Link href="/projects/new" className="shrink-0">
          <Button variant="primary" className="w-full sm:w-auto justify-center">
            <IconPlus size={16} />
            Create project
          </Button>
        </Link>
      </div>

      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Files processed"
            value={stats.filesProcessed}
            icon={<IconFiles size={18} stroke={1.5} />}
          />
          <StatCard
            label="Datasets ready"
            value={stats.datasetsReady}
            icon={<IconDatabase size={18} stroke={1.5} />}
          />
          <StatCard
            label="Avg quality score"
            value={
              stats.avgQualityScore !== null
                ? `${stats.avgQualityScore}%`
                : "—"
            }
            icon={<IconStar size={18} stroke={1.5} />}
          />
          <StatCard
            label="Storage used"
            value={formatBytes(stats.storageUsedBytes)}
            icon={<IconCloud size={18} stroke={1.5} />}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Get started
        </h2>
        <div className="bg-white border border-gray-100 rounded-xl p-4 lg:p-6">
          <p className="text-sm text-gray-600">
            Upload and process files inside a project. Each project runs its own
            cleaning pipeline — review results and export when ready.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/projects/new" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full justify-center">
                <IconPlus size={16} />
                Create project
              </Button>
            </Link>
            {recentProjects[0] ? (
              <Link href={`/projects/${recentProjects[0].id}`} className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full justify-center">
                  Open {recentProjects[0].name}
                  <IconArrowRight size={14} />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/projects" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full justify-center">
                  View projects
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Start from a template
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <Link href="/projects/new?module=LANGUAGE_VOICE">
            <div className="bg-white border border-gray-100 rounded-xl p-4 lg:p-5 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer group">
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
            <div className="bg-white border border-gray-100 rounded-xl p-4 lg:p-5 hover:border-brand-200 hover:shadow-sm transition-all cursor-pointer group">
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

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent projects
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1"
          >
            View all <IconChevronRight size={13} />
          </Link>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {recentProjects.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              No projects yet.{" "}
              <Link href="/projects/new" className="text-brand-600 hover:underline">
                Create your first project
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-gray-50">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {p.name}
                      </span>
                      <Badge variant={batchStatusToBadge(p.batchStatus)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 capitalize">
                        {moduleLabel(p.module)} · {p.fileCount} files · {p.updatedAt}
                      </span>
                      <span className="text-xs text-brand-600">Open</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table */}
              <table className="hidden lg:table w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Project
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Files
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Updated
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize text-xs">
                        {moduleLabel(p.module)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.fileCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={batchStatusToBadge(p.batchStatus)} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}
