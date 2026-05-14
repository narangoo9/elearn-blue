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
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const challenge = await db.challenge.findUnique({
    where: { id },
    include: { participants: { where: { userId: session.user.id } } },
  });
  if (!challenge || challenge.participants.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "decline") {
    await db.challenge.update({ where: { id }, data: { status: "DECLINED" } });
    return NextResponse.json({ status: "DECLINED" });
  }

  await db.challenge.update({ where: { id }, data: { status: "ACTIVE" } });

  await db.notification.create({
    data: {
      userId: challenge.creatorId,
      type: "CHALLENGE_ACCEPTED",
      title: "Challenge accepted",
      body: `${session.user.name} accepted your challenge`,
      data: { challengeId: id },
    },
  }).catch(() => null);

  return NextResponse.json({ status: "ACTIVE" });
}
