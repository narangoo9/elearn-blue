"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { LessonType } from "@prisma/client";
import { markLessonComplete } from "@/modules/courses/application/actions";
import { toast } from "@/components/ui/toaster";
import { CourseOutlinePanel } from "@/components/course/CourseOutlinePanel";
import { LessonProgressHeader } from "@/components/course/LessonProgressHeader";
import { LessonPlayer } from "@/components/course/LessonPlayer";
import { LessonTabs } from "@/components/course/LessonTabs";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  contentUrl: string | null;
  contentBody: string | null;
  duration: number | null;
  videoType?: "NONE" | "YOUTUBE" | "UPLOAD" | null;
  videoUrl?: string | null;
  videoProvider?: "YOUTUBE" | "CUSTOM" | null;
  sourceCreditName?: string | null;
  sourceCreditUrl?: string | null;
  isFree: boolean;
  isLocked: boolean;
  orderIndex: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Props {
  course: { id: string; title: string; modules: Module[] };
  activeLesson: Lesson;
  completedIds: string[];
  progressPercent: number;
  studentId: string;
}

export function LearningPlayer({ course, activeLesson, completedIds }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCompleted, setLocalCompleted] = useState(new Set(completedIds));

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCompleted = localCompleted.has(activeLesson.id);

  const completedCount = [...localCompleted].filter((id) =>
    allLessons.some((l) => l.id === id),
  ).length;
  const liveProgress =
    allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;

  const handleMarkComplete = () => {
    setLocalCompleted((prev) => new Set([...prev, activeLesson.id]));
    startTransition(async () => {
      const result = await markLessonComplete(activeLesson.id);
      if (result && "error" in result) {
        setLocalCompleted((prev) => {
          const next = new Set(prev);
          next.delete(activeLesson.id);
          return next;
        });
        toast({ type: "error", title: result.error as string });
        return;
      }

      if (result?.courseCompleted) {
        toast({
          type: "success",
          title: "Курс дууслаа!",
          description: "Сертификат бэлэн боллоо.",
        });
      } else {
        toast({ type: "success", title: "Хичээл дууслаа" });
        if (nextLesson) {
          router.push(`/student/courses/${course.id}/learn?lessonId=${nextLesson.id}`);
        }
      }
    });
  };

  return (
    <div className="-m-5 flex h-[calc(100vh-4rem)] overflow-hidden">
      <CourseOutlinePanel
        course={course}
        activeLesson={activeLesson}
        completedIds={localCompleted}
        progressPercent={liveProgress}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F4FF]">
        <LessonProgressHeader
          course={course}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          currentIndex={currentIndex}
          totalLessons={allLessons.length}
          isCompleted={isCompleted}
          isPending={isPending}
          onMarkComplete={handleMarkComplete}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-5 p-5">
            <LessonPlayer lesson={activeLesson} />

            <div>
              <h1 className="text-[19px] font-black leading-snug text-slate-900">
                {activeLesson.title}
              </h1>
              {activeLesson.description ? (
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                  {activeLesson.description}
                </p>
              ) : null}
            </div>

            <LessonTabs lesson={activeLesson} />

            <div className="flex items-center justify-between border-t border-violet-100 pb-6 pt-5">
              {prevLesson ? (
                <Link
                  href={`/student/courses/${course.id}/learn?lessonId=${prevLesson.id}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  <ArrowLeft size={14} /> Өмнөх хичээл
                </Link>
              ) : (
                <div />
              )}

              {!isCompleted ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-600 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {isPending ? "Хадгалж байна..." : "Хичээл дуусгасан гэж тэмдэглэх"}
                </button>
              ) : (
                <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-2.5 text-[13px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                  <CheckCircle2 size={14} /> Дууссан
                </span>
              )}

              {nextLesson ? (
                <Link
                  href={`/student/courses/${course.id}/learn?lessonId=${nextLesson.id}`}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-500"
                >
                  Дараагийн хичээл <ArrowRight size={14} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
