import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Bookmark, Users, Star, BookOpen } from "lucide-react";
import { LearningArtwork } from "@/components/course/LearningArtwork";
import { SaveCourseButton } from "@/components/course/SaveCourseButton";
import { Badge } from "@/components/ui/index";

export const metadata: Metadata = { title: "Хадгалсан курсууд — EduNity" };

const levelLabels: Record<string, string> = {
  BEGINNER: "Эхлэгч",
  INTERMEDIATE: "Дунд",
  ADVANCED: "Дэвшилтэт",
  ALL_LEVELS: "Бүх түвшин",
};
const levelColors: Record<string, "success" | "warning" | "destructive" | "info"> = {
  BEGINNER: "success",
  INTERMEDIATE: "warning",
  ADVANCED: "destructive",
  ALL_LEVELS: "info",
};

export default async function SavedCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const saved = await db.savedCourse.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          level: true,
          category: { select: { name: true } },
          instructor: { select: { name: true } },
          _count: { select: { enrollments: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const courses = saved.map((s) => s.course);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/15">
          <Bookmark size={18} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">Хадгалсан курсууд</h1>
          <p className="text-sm text-muted-foreground">{courses.length} курс хадгалагдсан байна</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-violet-200 bg-card py-16 text-center dark:border-violet-800/40">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/10">
            <Bookmark size={28} className="text-violet-400" />
          </div>
          <p className="mb-1 text-sm font-semibold text-foreground">Хадгалсан курс байхгүй</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Каталогоос курс хайж, bookmark дарж хадгалаарай
          </p>
          <Link
            href="/student/catalog"
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-violet-500"
          >
            <BookOpen size={14} />
            Каталог руу очих
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const avgRating =
              course.reviews.length > 0
                ? (course.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
                : null;

            return (
              <div key={course.id} className="group relative overflow-hidden rounded-2xl border border-[#E9DFFF] dark:border-[#2E2146] bg-white dark:bg-[#1C142B] hover:border-violet-400/60 hover:shadow-[0_8px_32px_rgba(124,58,237,0.12)] hover:-translate-y-1 transition-all duration-200">
                {/* Thumbnail */}
                <Link href={`/courses/${course.slug}`}>
                  <div className="relative h-40 overflow-hidden bg-muted">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <LearningArtwork
                        title={course.title}
                        subtitle={course.instructor.name}
                        badge={course.category?.name ?? "Course"}
                        className="h-full w-full"
                      />
                    )}
                    <div className="absolute left-2 top-2">
                      <Badge
                        variant={levelColors[course.level] ?? "info"}
                        className="shadow-sm text-[9px] py-0 leading-tight"
                      >
                        {levelLabels[course.level] ?? course.level}
                      </Badge>
                    </div>
                  </div>
                </Link>

                {/* Save button */}
                <div className="absolute top-2 right-2 pointer-events-auto">
                  <SaveCourseButton
                    courseId={course.id}
                    initialSaved={true}
                    size={14}
                    className="h-7 w-7 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg border-0 hover:bg-white"
                  />
                </div>

                {/* Card body */}
                <Link href={`/courses/${course.slug}`} className="block p-4">
                  <p className="mb-1 line-clamp-2 text-[13px] font-bold leading-snug text-[#111827] dark:text-[#F8FAFC]">
                    {course.title}
                  </p>
                  <p className="mb-3 text-[11px] text-[#6B7280] dark:text-[#A1A1AA]">{course.instructor.name}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF] dark:text-[#71717A]">
                    <span className="flex items-center gap-1 font-medium">
                      <Users size={10} /> {course._count.enrollments}
                    </span>
                    {avgRating && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {avgRating}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
