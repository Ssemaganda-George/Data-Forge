import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/api-keys";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(60).default("API key"),
});

// Key management is dashboard-only (session cookie) — you can't create a new
// key using an API key.
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { key, prefix, hash } = generateApiKey();

  const record = await db.apiKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      keyPrefix: prefix,
      keyHash: hash,
    },
  });

  // Plaintext key is only ever returned here — it isn't stored.
  return NextResponse.json(
    { id: record.id, name: record.name, key, createdAt: record.createdAt },
    { status: 201 }
  );
}
