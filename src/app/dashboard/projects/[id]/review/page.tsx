import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireServerSession } from "@/lib/auth";
import { getProjectDetail } from "@/lib/project-queries";
import { ReviewFilesPanel } from "@/components/review-files-panel";
import { IconArrowLeft } from "@tabler/icons-react";

export const metadata: Metadata = { title: "Review files" };
export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireServerSession();
  const project = await getProjectDetail(session.user.id, params.id);
  if (!project) notFound();

  const flaggedCount = project.files.filter((f) => f.flagged).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${params.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <IconArrowLeft size={14} />
          Back to project
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Review files</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {project.name} · {flaggedCount} file
            {flaggedCount !== 1 ? "s" : ""} flagged for review
          </p>
        </div>
      </div>

      <ReviewFilesPanel projectId={params.id} files={project.files} />
    </div>
  );
}
