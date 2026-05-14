import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") ?? "public";
  const q = req.nextUrl.searchParams.get("q") ?? "";

  if (type === "mine") {
    const groups = await db.studyGroup.findMany({
      where: { members: { some: { userId: session.user.id } } },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, username: true, level: true, xp: true } },
          },
        },
        _count: { select: { members: true, messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ groups: groups.map((g) => ({
      ...g,
      memberCount: g._count.members,
      messageCount: g._count.messages,
      myMembership: g.members.find((m) => m.userId === session.user.id) ?? null,
    })) });
  }

  const groups = await db.studyGroup.findMany({
    where: {
      isPublic: true,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: {
      creator: { select: { name: true, avatarUrl: true } },
      _count: { select: { members: true } },
      members: { where: { userId: session.user.id }, select: { role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    groups: groups.map((g) => ({
      ...g,
      memberCount: g._count.members,
      myMembership: g.members[0] ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, isPublic, maxMembers, tags } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const group = await db.studyGroup.create({
    data: {
      name: name.trim(),
      description,
      isPublic: isPublic ?? true,
      maxMembers: maxMembers ?? 30,
      tags: tags ?? [],
      creatorId: session.user.id,
      members: { create: { userId: session.user.id, role: "OWNER" } },
    },
  });

  return NextResponse.json({ group }, { status: 201 });
}
