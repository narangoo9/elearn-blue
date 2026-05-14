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
  const goals = await db.studyGroupGoal.findMany({
    where: { groupId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ goals });
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

  const { title, description, dueDate } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const goal = await db.studyGroupGoal.create({
    data: { groupId: id, title: title.trim(), description, dueDate: dueDate ? new Date(dueDate) : null },
  });
  return NextResponse.json({ goal }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { goalId, isCompleted } = await req.json();
  if (!goalId) return NextResponse.json({ error: "Missing goalId" }, { status: 400 });

  const membership = await db.studyGroupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: session.user.id } },
  });
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const goal = await db.studyGroupGoal.update({
    where: { id: goalId },
    data: { isCompleted, completedAt: isCompleted ? new Date() : null },
  });
  return NextResponse.json({ goal });
}
