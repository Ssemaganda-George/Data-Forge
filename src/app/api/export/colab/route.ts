import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { buildColabNotebook } from "@/lib/colab-notebook";

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? req.nextUrl.origin;

  const notebook = buildColabNotebook(baseUrl);
  return new NextResponse(notebook, {
    headers: {
      "Content-Type": "application/x-ipynb+json",
      "Content-Disposition": 'attachment; filename="dataforge-import.ipynb"',
    },
  });
}
