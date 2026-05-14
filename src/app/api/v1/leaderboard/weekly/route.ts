import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await db.leaderboardEntry.findMany({
    take: 50,
    orderBy: { weeklyXp: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, username: true, level: true, streak: true } },
    },
  });

  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
  const myRank = ranked.find((e) => e.userId === session.user.id);

  return NextResponse.json({ entries: ranked, myRank: myRank?.rank ?? null });
}
