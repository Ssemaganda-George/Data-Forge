import type { Metadata } from "next";
import Link from "next/link";
import { requireServerSession } from "@/lib/auth";
import {
  batchStatusToBadge,
  getProjectsForUser,
  moduleLabel,
} from "@/lib/project-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlus, IconSearch } from "@tabler/icons-react";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await requireServerSession();
  const projects = await getProjectsForUser(session.user.id);

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

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-16 text-center">
          <p className="text-sm text-gray-500 mb-4">No projects yet.</p>
          <Link href="/projects/new">
            <Button variant="primary">
              <IconPlus size={16} />
              Create your first project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={batchStatusToBadge(p.batchStatus)} />
                  <span className="text-xs text-gray-400">{p.createdAt}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {moduleLabel(p.module)} · {p.fileCount.toLocaleString()} files
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
