import { db } from "@/lib/db";
import type { ActivityType } from "@prisma/client";

interface ActivityData {
  courseTitle?: string;
  courseId?: string;
  courseSlug?: string;
  lessonTitle?: string;
  badgeName?: string;
  badge?: string;
  streak?: number;
  rank?: number;
  weeklyXp?: number;
  challengeTitle?: string;
  level?: number;
  xp?: number;
  groupName?: string;
  groupId?: string;
  [key: string]: unknown;
}

export async function publishActivity(
  userId: string,
  type: ActivityType,
  data: ActivityData,
  isPublic = true
): Promise<void> {
  try {
    await db.activityFeed.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { userId, type, data: data as any, isPublic },
    });
  } catch {
    // Never throw — feed publish must not break primary flows
  }
}

export async function onCourseCompleted(
  userId: string,
  courseId: string,
  courseTitle: string,
  courseSlug: string
) {
  await publishActivity(userId, "COURSE_COMPLETED", { courseId, courseTitle, courseSlug });
}

export async function onBadgeEarned(userId: string, badge: string, badgeName: string) {
  await publishActivity(userId, "BADGE_EARNED", { badge, badgeName });
}

export async function onStreakMilestone(userId: string, streak: number) {
  if (![3, 7, 14, 30, 60, 100, 365].includes(streak)) return;
  await publishActivity(userId, "STREAK_MILESTONE", { streak });
}

export async function onLevelUp(userId: string, level: number) {
  await publishActivity(userId, "LEVEL_UP", { level });
}

export async function onLeaderboardTop(userId: string, rank: number, weeklyXp: number) {
  if (rank > 10) return;
  await publishActivity(userId, "LEADERBOARD_TOP", { rank, weeklyXp });
}

export async function onXpMilestone(userId: string, xp: number) {
  const milestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];
  if (!milestones.includes(xp)) return;
  await publishActivity(userId, "XP_MILESTONE", { xp });
}

export async function onCertificateEarned(userId: string, courseTitle: string, courseId: string) {
  await publishActivity(userId, "CERTIFICATE_EARNED", { courseTitle, courseId });
}

export async function onQuizPerfect(userId: string, courseTitle: string) {
  await publishActivity(userId, "QUIZ_PERFECT", { courseTitle });
}

export async function onGroupJoined(userId: string, groupId: string, groupName: string) {
  await publishActivity(userId, "JOINED_GROUP", { groupId, groupName });
}

export async function onFinalTaskCompleted(userId: string, courseTitle: string, courseId: string) {
  await publishActivity(userId, "FINAL_TASK_COMPLETED", { courseTitle, courseId });
}
