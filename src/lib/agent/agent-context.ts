import { db } from "@/lib/db";
import type { AgentContext, CertificateInfo, EnrolledCourseInfo } from "./agent-types";

/**
 * Builds a full AgentContext for a given userId by querying the database.
 * Every query is wrapped in a try-catch so a partial DB failure never crashes
 * the agent — it just returns safe mock/empty values.
 */
export async function getAgentContext(
  userId: string,
  options?: { pageContext?: string; courseId?: string; lessonId?: string },
): Promise<AgentContext> {
  const empty: AgentContext = {
    userId,
    userName: null,
    level: 1,
    xp: 0,
    streak: 0,
    enrolledCourses: [],
    activeCourse: null,
    overallProgress: 0,
    totalCompletedLessons: 0,
    totalLessons: 0,
    certificates: [],
    pageContext: options?.pageContext,
    courseId: options?.courseId,
    lessonId: options?.lessonId,
  };

  try {
    // ── 1. Parallel: user info + active enrollments + certificates ────────────
    const [user, enrollments, rawCerts, recentProgressRows] = await Promise.all([
      db.user
        .findUnique({
          where: { id: userId },
          select: { name: true, level: true, xp: true, streak: true },
        })
        .catch(() => null),

      db.enrollment
        .findMany({
          where: { studentId: userId, status: { in: ["ACTIVE", "COMPLETED"] } },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                modules: {
                  select: {
                    id: true,
                    lessons: { select: { id: true, title: true } },
                  },
                },
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
          take: 20,
        })
        .catch(() => [] as never[]),

      db.certificate
        .findMany({
          where: { studentId: userId, courseId: { not: null } },
          select: {
            courseId: true,
            issuedAt: true,
            course: { select: { title: true } },
          },
          orderBy: { issuedAt: "desc" },
        })
        .catch(() => [] as never[]),

      // Most recently touched progress records (to determine last lesson)
      db.progress
        .findMany({
          where: { studentId: userId },
          select: { lessonId: true, courseId: true, isCompleted: true, lastAccessedAt: true },
          orderBy: { lastAccessedAt: "desc" },
          take: 50,
        })
        .catch(() => [] as never[]),
    ]);

    // ── 2. Build lookup maps ──────────────────────────────────────────────────
    const completedLessonIds = new Set<string>(
      (recentProgressRows as { lessonId: string; isCompleted: boolean }[])
        .filter((p) => p.isCompleted)
        .map((p) => p.lessonId),
    );

    // If recent 50 rows might miss some, get all completed for enrolled courses
    const enrolledCourseIds = (enrollments as { course: { id: string } }[]).map((e) => e.course.id);
    if (enrolledCourseIds.length > 0) {
      const allCompleted = await db.progress
        .findMany({
          where: {
            studentId: userId,
            courseId: { in: enrolledCourseIds },
            isCompleted: true,
          },
          select: { lessonId: true, courseId: true },
        })
        .catch(() => [] as { lessonId: string; courseId: string }[]);

      for (const p of allCompleted) completedLessonIds.add(p.lessonId);
    }

    // Map courseId → most recently accessed progress row
    const lastAccessedByCourse = new Map<
      string,
      { lessonId: string; lastAccessedAt: Date | null }
    >();
    for (const p of recentProgressRows as {
      lessonId: string;
      courseId: string;
      lastAccessedAt: Date | null;
    }[]) {
      if (!lastAccessedByCourse.has(p.courseId)) {
        lastAccessedByCourse.set(p.courseId, {
          lessonId: p.lessonId,
          lastAccessedAt: p.lastAccessedAt,
        });
      }
    }

    const certificateCourseIds = new Set<string>(
      (rawCerts as { courseId: string | null }[])
        .filter((c) => c.courseId)
        .map((c) => c.courseId!),
    );

    // ── 3. Build enrolled courses list ────────────────────────────────────────
    const enrolledCourses: EnrolledCourseInfo[] = (
      enrollments as {
        course: {
          id: string;
          title: string;
          modules: { id: string; lessons: { id: string; title: string }[] }[];
        };
      }[]
    ).map((enrollment) => {
      const course = enrollment.course;
      const allLessons = course.modules.flatMap((m) => m.lessons);
      const totalLessons = allLessons.length;
      const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
      const progress =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      const lastAccess = lastAccessedByCourse.get(course.id);
      const lastLesson = lastAccess
        ? allLessons.find((l) => l.id === lastAccess.lessonId) ?? null
        : null;

      return {
        id: course.id,
        title: course.title,
        completedLessons: completedCount,
        totalLessons,
        progress,
        lastLessonId: lastLesson?.id ?? null,
        lastLessonTitle: lastLesson?.title ?? null,
        moduleCount: course.modules.length,
        hasCertificate: certificateCourseIds.has(course.id),
      };
    });

    // ── 4. Determine active course ────────────────────────────────────────────
    // If page context carries a courseId, prioritize that course
    let activeCourse: EnrolledCourseInfo | null = null;
    if (options?.courseId) {
      activeCourse = enrolledCourses.find((c) => c.id === options.courseId) ?? null;
    }
    if (!activeCourse && recentProgressRows.length > 0) {
      const recentCourseId = (
        recentProgressRows as { courseId: string }[]
      )[0].courseId;
      activeCourse = enrolledCourses.find((c) => c.id === recentCourseId) ?? null;
    }
    if (!activeCourse && enrolledCourses.length > 0) {
      // Fall back to the course with highest progress
      activeCourse = [...enrolledCourses].sort((a, b) => b.progress - a.progress)[0];
    }

    // ── 5. Aggregate stats ────────────────────────────────────────────────────
    const totalCompletedLessons = enrolledCourses.reduce(
      (sum, c) => sum + c.completedLessons,
      0,
    );
    const totalLessons = enrolledCourses.reduce((sum, c) => sum + c.totalLessons, 0);
    const overallProgress =
      totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

    // ── 6. Certificate info ───────────────────────────────────────────────────
    const certificates: CertificateInfo[] = (
      rawCerts as { courseId: string | null; issuedAt: Date; course: { title: string } | null }[]
    )
      .filter((c) => c.courseId)
      .map((c) => ({
        courseId: c.courseId!,
        courseTitle: c.course?.title ?? null,
        issuedAt: c.issuedAt,
      }));

    return {
      userId,
      userName: user?.name ?? null,
      level: user?.level ?? 1,
      xp: user?.xp ?? 0,
      streak: user?.streak ?? 0,
      enrolledCourses,
      activeCourse,
      overallProgress,
      totalCompletedLessons,
      totalLessons,
      certificates,
      pageContext: options?.pageContext,
      courseId: options?.courseId,
      lessonId: options?.lessonId,
    };
  } catch (err) {
    console.error("[agent-context] Failed to build context:", err);
    return empty;
  }
}
