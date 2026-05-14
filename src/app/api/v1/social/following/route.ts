import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId") ?? session.user.id;
  const cursor = req.nextUrl.searchParams.get("cursor");
  const take = 20;

  const follows = await db.follow.findMany({
    where: { followerId: userId },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      following: {
        select: { id: true, name: true, avatarUrl: true, username: true, level: true, xp: true },
      },
    },
  });

  const nextCursor = follows.length === take ? follows[follows.length - 1].id : null;
  return NextResponse.json({ following: follows.map((f) => f.following), nextCursor });
}
