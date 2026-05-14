import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId || targetUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  // Check block in either direction
  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: session.user.id },
      ],
    },
  });
  if (block) return NextResponse.json({ error: "Blocked" }, { status: 403 });

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await db.follow.create({ data: { followerId: session.user.id, followingId: targetUserId } });

  // Notify the followed user
  await db.notification.create({
    data: {
      userId: targetUserId,
      type: "NEW_FOLLOWER",
      title: "New follower",
      body: `${session.user.name} started following you`,
      data: { followerId: session.user.id },
    },
  }).catch(() => null);

  return NextResponse.json({ following: true });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetUserId = req.nextUrl.searchParams.get("userId") ?? session.user.id;

  const [followersCount, followingCount, isFollowing] = await Promise.all([
    db.follow.count({ where: { followingId: targetUserId } }),
    db.follow.count({ where: { followerId: targetUserId } }),
    targetUserId !== session.user.id
      ? db.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
        }).then(Boolean)
      : Promise.resolve(false),
  ]);

  return NextResponse.json({ followersCount, followingCount, isFollowing });
}
