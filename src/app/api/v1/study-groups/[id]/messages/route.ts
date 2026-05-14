import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cursor = req.nextUrl.searchParams.get("cursor");
  const take = 30;

  const messages = await db.studyGroupMessage.findMany({
    where: { groupId: id, ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}) },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, username: true } },
    },
  });

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: messages.length === take ? messages[0].createdAt.toISOString() : null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const membership = await db.studyGroupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { content, imageUrl } = await req.json();
  if (!content?.trim() || content.length > 2000) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const message = await db.studyGroupMessage.create({
    data: { groupId: id, userId: session.user.id, content: content.trim(), imageUrl },
    include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } },
  });

  await db.studyGroup.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ message }, { status: 201 });
}
