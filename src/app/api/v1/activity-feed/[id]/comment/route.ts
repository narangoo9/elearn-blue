import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const comments = await db.activityComment.findMany({
    where: { activityId: id },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, username: true } },
    },
  });
  return NextResponse.json({ comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim() || content.length > 500) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const comment = await db.activityComment.create({
    data: { userId: session.user.id, activityId: id, content: content.trim() },
    include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } },
  });

  const activity = await db.activityFeed.findUnique({ where: { id }, select: { userId: true } });
  if (activity && activity.userId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: activity.userId,
        type: "ACTIVITY_COMMENTED",
        title: "New comment",
        body: `${session.user.name} commented on your activity`,
        data: { activityId: id, commenterId: session.user.id },
      },
    }).catch(() => null);
  }

  return NextResponse.json({ comment }, { status: 201 });
}
