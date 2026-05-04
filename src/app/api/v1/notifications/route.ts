import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorized } from "@/shared/utils/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id, channel: "IN_APP" },
    orderBy: { sentAt: "desc" },
    take: 10,
    select: { id: true, type: true, title: true, body: true, isRead: true, sentAt: true },
  });

  // Mark fetched ones as read
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return NextResponse.json({ notifications });
}
