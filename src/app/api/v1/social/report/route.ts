import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_REASONS = ["spam", "harassment", "inappropriate", "impersonation", "other"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId, reason, details } = await req.json();
  if (!targetUserId || !reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
  }

  await db.userReport.create({
    data: { reporterId: session.user.id, reportedId: targetUserId, reason, details },
  });

  return NextResponse.json({ success: true });
}
