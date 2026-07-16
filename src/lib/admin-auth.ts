import { requireServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await requireServerSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
