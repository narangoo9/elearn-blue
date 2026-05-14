import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfilePageClient } from "./ProfilePageClient";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const user = await db.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
    select: { name: true, bio: true },
  });
  if (!user) return { title: "User not found" };
  return { title: `${user.name} — EduNity`, description: user.bio ?? undefined };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();

  const profile = await db.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
    select: {
      id: true, name: true, username: true, avatarUrl: true, bio: true,
      level: true, xp: true, streak: true, skills: true, profileTheme: true,
      profileStatus: true, statusEmoji: true, profileBorder: true, mascotId: true,
      socialLinks: true, favoriteCategories: true, isProfilePublic: true, createdAt: true,
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

  if (!profile) notFound();

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
    if (block) redirect("/student");
  }

  if (!profile.isProfilePublic && session?.user?.id !== profile.id) {
    redirect("/student");
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

  return (
    <ProfilePageClient
      profile={{
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        badges: profile.badges.map((b) => ({ badge: b.badge, earnedAt: b.earnedAt.toISOString() })),
      }}
      isFollowing={isFollowing}
      completedCourses={completedCourses.map((e) => ({
        course: e.course,
        completedAt: e.completedAt?.toISOString() ?? null,
      }))}
      recentActivity={recentActivity.map((a) => ({
        ...a,
        data: (a.data ?? {}) as Record<string, unknown>,
        createdAt: a.createdAt.toISOString(),
      }))}
      currentUserId={session?.user?.id ?? null}
    />
  );
}
