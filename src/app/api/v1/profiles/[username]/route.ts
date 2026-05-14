import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  const { username } = await params;

  const profile = await db.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
    select: {
      id: true, name: true, username: true, avatarUrl: true, bio: true,
      level: true, xp: true, streak: true, skills: true, profileTheme: true,
      profileStatus: true, statusEmoji: true, profileBorder: true, mascotId: true,
      socialLinks: true, favoriteCategories: true, isProfilePublic: true,
      createdAt: true,
      badges: { select: { badge: true, earnedAt: true } },
      _count: {
        select: {
          following: true,
          followers: true,
          enrollments: { where: { status: "COMPLETED" } },
        },
      },
    },
  });

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Block check
  if (session?.user) {
    const block = await db.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: session.user.id, blockedId: profile.id },
          { blockerId: profile.id, blockedId: session.user.id },
        ],
      },
    });
    if (block) return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }

  if (!profile.isProfilePublic && session?.user?.id !== profile.id) {
    return NextResponse.json({ error: "Private profile" }, { status: 403 });
  }

  const [isFollowing, completedCourses, recentActivity] = await Promise.all([
    session?.user && session.user.id !== profile.id
      ? db.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: profile.id } },
        }).then(Boolean)
      : Promise.resolve(false),
    db.enrollment.findMany({
      where: { studentId: profile.id, status: "COMPLETED" },
      include: { course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } } },
      take: 6,
      orderBy: { completedAt: "desc" },
    }),
    db.activityFeed.findMany({
      where: { userId: profile.id, isPublic: true },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, username: true, level: true } },
        _count: { select: { likes: true, comments: true } },
        likes: session?.user ? { where: { userId: session.user.id }, select: { userId: true } } : { take: 0 },
      },
    }),
  ]);

  return NextResponse.json({ profile, isFollowing, completedCourses, recentActivity });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await params;
  const profile = await db.user.findFirst({ where: { OR: [{ username }, { id: username }] }, select: { id: true } });
  if (!profile || profile.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ["username", "bio", "skills", "profileTheme", "profileStatus", "statusEmoji",
    "profileBorder", "mascotId", "socialLinks", "favoriteCategories", "isProfilePublic"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (data.username) {
    const slug = String(data.username).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
    if (!slug) return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    const taken = await db.user.findFirst({ where: { username: slug, NOT: { id: session.user.id } } });
    if (taken) return NextResponse.json({ error: "Username taken" }, { status: 409 });
    data.username = slug;
  }

  const updated = await db.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ profile: updated });
}
