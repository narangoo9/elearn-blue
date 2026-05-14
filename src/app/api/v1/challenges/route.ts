import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") ?? "mine";

  if (type === "incoming") {
    const challenges = await db.challenge.findMany({
      where: {
        participants: { some: { userId: session.user.id } },
        status: "PENDING",
        creatorId: { not: session.user.id },
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, username: true, level: true } },
        participants: { where: { userId: session.user.id } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ challenges });
  }

  if (type === "active") {
    const challenges = await db.challenge.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { participants: { some: { userId: session.user.id } } },
        ],
        status: "ACTIVE",
        endsAt: { gt: new Date() },
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, username: true, level: true } },
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
      orderBy: { endsAt: "asc" },
    });
    return NextResponse.json({ challenges });
  }

  // mine
  const challenges = await db.challenge.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { participants: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true, username: true, level: true } },
      participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json({ challenges });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, type, targetValue, endsAt, xpReward, challengedUserId } = await req.json();
  if (!title || !type || !targetValue || !endsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const challenge = await db.challenge.create({
    data: {
      creatorId: session.user.id,
      title,
      type,
      targetValue,
      endsAt: new Date(endsAt),
      xpReward: xpReward ?? 50,
      status: challengedUserId ? "PENDING" : "ACTIVE",
      participants: {
        create: { userId: session.user.id },
      },
    },
  });

  if (challengedUserId) {
    await db.userChallenge.create({ data: { userId: challengedUserId, challengeId: challenge.id } });
    await db.notification.create({
      data: {
        userId: challengedUserId,
        type: "CHALLENGE_INVITE",
        title: "Challenge invite",
        body: `${session.user.name} challenged you: ${title}`,
        data: { challengeId: challenge.id, challengerId: session.user.id },
      },
    }).catch(() => null);
  }

  return NextResponse.json({ challenge }, { status: 201 });
}
