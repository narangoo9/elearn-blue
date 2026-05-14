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

  const existing = await db.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId: session.user.id, blockedId: targetUserId } },
  });

  if (existing) {
    await db.userBlock.delete({ where: { id: existing.id } });
    return NextResponse.json({ blocked: false });
  }

  // Block removes follow in both directions
  await db.$transaction([
    db.userBlock.create({ data: { blockerId: session.user.id, blockedId: targetUserId } }),
    db.follow.deleteMany({
      where: {
        OR: [
          { followerId: session.user.id, followingId: targetUserId },
          { followerId: targetUserId, followingId: session.user.id },
        ],
      },
    }),
  ]);

  return NextResponse.json({ blocked: true });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetUserId = req.nextUrl.searchParams.get("userId");
  if (!targetUserId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: session.user.id },
      ],
    },
  });

  return NextResponse.json({ blocked: !!block });
}
