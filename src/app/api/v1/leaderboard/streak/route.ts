import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({
    where: { streak: { gt: 0 } },
    orderBy: { streak: "desc" },
    take: 50,
    select: { id: true, name: true, avatarUrl: true, username: true, level: true, streak: true, xp: true },
  });

  const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));
  return NextResponse.json({ entries: ranked });
}
