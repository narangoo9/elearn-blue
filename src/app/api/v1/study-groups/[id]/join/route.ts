import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const group = await db.studyGroup.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await db.studyGroupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });

  if (action === "leave" || existing) {
    if (!existing) return NextResponse.json({ error: "Not a member" }, { status: 400 });
    if (existing.role === "OWNER") return NextResponse.json({ error: "Owner cannot leave" }, { status: 400 });
    await db.studyGroupMember.delete({ where: { id: existing.id } });
    return NextResponse.json({ joined: false });
  }

  if (!group.isPublic) return NextResponse.json({ error: "Private group" }, { status: 403 });
  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ error: "Group is full" }, { status: 409 });
  }

  await db.studyGroupMember.create({ data: { groupId: id, userId: session.user.id, role: "MEMBER" } });
  return NextResponse.json({ joined: true });
}
