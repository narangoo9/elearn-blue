import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const follows = await db.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });
  const friendIds = [session.user.id, ...follows.map((f) => f.followingId)];

  const entries = await db.leaderboardEntry.findMany({
    where: { userId: { in: friendIds } },
    orderBy: { totalXp: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, username: true, level: true, streak: true } },
    },
  });

  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
  return NextResponse.json({ entries: ranked });
}
