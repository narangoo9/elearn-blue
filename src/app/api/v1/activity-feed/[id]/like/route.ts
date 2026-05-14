import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await db.activityLike.findUnique({
    where: { userId_activityId: { userId: session.user.id, activityId: id } },
  });

  if (existing) {
    await db.activityLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await db.activityLike.create({ data: { userId: session.user.id, activityId: id } });

  // Notify owner
  const activity = await db.activityFeed.findUnique({ where: { id }, select: { userId: true } });
  if (activity && activity.userId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: activity.userId,
        type: "ACTIVITY_LIKED",
        title: "Someone liked your activity",
        body: `${session.user.name} liked your activity`,
        data: { activityId: id, likerId: session.user.id },
      },
    }).catch(() => null);
  }

  return NextResponse.json({ liked: true });
}
