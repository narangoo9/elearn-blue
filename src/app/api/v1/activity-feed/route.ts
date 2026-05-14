import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") ?? "following";
  const cursor = req.nextUrl.searchParams.get("cursor");
  const userId = req.nextUrl.searchParams.get("userId");
  const take = 15;

  // Get blocked user IDs
  const blocks = await db.userBlock.findMany({
    where: { OR: [{ blockerId: session.user.id }, { blockedId: session.user.id }] },
    select: { blockerId: true, blockedId: true },
  });
  const blockedIds = blocks.map((b) =>
    b.blockerId === session.user.id ? b.blockedId : b.blockerId
  );

  let userIdFilter: string[] | undefined;
  if (type === "following") {
    const follows = await db.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    userIdFilter = [session.user.id, ...follows.map((f) => f.followingId)];
  } else if (type === "user" && userId) {
    userIdFilter = [userId];
  }

  const items = await db.activityFeed.findMany({
    where: {
      ...(userIdFilter ? { userId: { in: userIdFilter } } : {}),
      userId: { notIn: blockedIds },
      isPublic: true,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, username: true, level: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: session.user.id }, select: { userId: true } },
    },
  });

  const nextCursor = items.length === take ? items[items.length - 1].createdAt.toISOString() : null;
  return NextResponse.json({ items, nextCursor, hasMore: !!nextCursor });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, data, isPublic } = await req.json();
  if (!type || !data) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const item = await db.activityFeed.create({
    data: { userId: session.user.id, type, data, isPublic: isPublic ?? true },
  });
  return NextResponse.json({ item }, { status: 201 });
}
