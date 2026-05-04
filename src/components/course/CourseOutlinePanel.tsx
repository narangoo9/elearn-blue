"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  FileText,
  BookOpen,
  GraduationCap,
  Clock,
} from "lucide-react";
import type { LessonType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: number | null;
  videoType?: "NONE" | "YOUTUBE" | "UPLOAD" | null;
  videoUrl?: string | null;
  sectionId?: string | null;
  startTimeSeconds?: number | null;
  endTimeSeconds?: number | null;
  isFree: boolean;
  isLocked: boolean;
  orderIndex: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseOutlinePanelProps {
  course: { id: string; title: string; modules: Module[] };
  activeLesson: { id: string };
  completedIds: Set<string>;
  progressPercent: number;
}

const LESSON_ICONS: Record<string, React.ElementType> = {
  VIDEO: Play,
  TEXT: FileText,
  PDF: FileText,
  ASSIGNMENT: BookOpen,
  QUIZ: GraduationCap,
  LIVE_SESSION: Play,
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CourseOutlinePanel({
  course,
  activeLesson,
  completedIds,
  progressPercent,
}: CourseOutlinePanelProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(course.modules.map((m) => m.id)),
  );

  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-violet-100/70 bg-white shadow-[1px_0_0_0_rgba(124,58,237,0.04)]">
      {/* Header */}
      <div className="shrink-0 border-b border-violet-100/60 px-4 py-4">
        <Link
          href="/student/courses"
          className="mb-3 inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-violet-600"
        >
          <ChevronLeft size={12} /> Самбар руу буцах
        </Link>

        <h2 className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-800">
          {course.title}
        </h2>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{totalLessons} lessons</span>
            <span className="text-[11px] font-bold text-violet-600">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, idx) => {
          const isOpen = openModules.has(module.id);
          const doneCnt = module.lessons.filter((l) => completedIds.has(l.id)).length;
          const allDone = doneCnt === module.lessons.length && module.lessons.length > 0;

          return (
            <div key={module.id} className="border-b border-slate-50/80">
              {/* Module header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-violet-50/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-slate-700">
                    {idx + 1}-р хэсэг: {module.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[10px] font-semibold",
                      allDone ? "text-emerald-500" : "text-slate-400",
                    )}
                  >
                    {doneCnt}/{module.lessons.length} completed
                  </p>
                </div>
                <ChevronDown
                  size={13}
                  className={cn(
                    "shrink-0 text-slate-300 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Lesson list */}
              {isOpen && (
                <div className="pb-1.5">
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLesson.id;
                    const isDone = completedIds.has(lesson.id);
                    const isLocked = lesson.isLocked;
                    const Icon = LESSON_ICONS[lesson.type] ?? FileText;

                    return (
                      <Link
                        key={lesson.id}
                        href={
                          isLocked
                            ? "#"
                            : `/student/courses/${course.id}/learn?lessonId=${lesson.id}`
                        }
                        onClick={isLocked ? (e) => e.preventDefault() : undefined}
                        className={cn(
                          "relative flex items-start gap-2.5 px-4 py-2.5 transition-all",
                          isActive
                            ? "bg-gradient-to-r from-violet-50 to-purple-50/50"
                            : isLocked
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-slate-50/80",
                        )}
                      >
                        {/* Active left border */}
                        {isActive && (
                          <div className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-violet-500" />
                        )}

                        {/* Status icon */}
                        <div className="mt-0.5 flex w-4 shrink-0 items-center justify-center">
                          {isLocked ? (
                            <Lock size={11} className="text-slate-300" />
                          ) : isDone ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : isActive ? (
                            <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-violet-500">
                              <div className="h-[5px] w-[5px] rounded-full bg-violet-500" />
                            </div>
                          ) : (
                            <Circle size={13} className="text-slate-200" />
                          )}
                        </div>

                        {/* Lesson info */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "line-clamp-2 text-[11px] leading-snug",
                              isActive
                                ? "font-semibold text-violet-700"
                                : "font-medium text-slate-600",
                            )}
                          >
                            {lesson.title}
                          </p>
                          {lesson.duration ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                              <Clock size={8} />
                              {formatDuration(lesson.duration)}
                            </p>
                          ) : null}
                          {lesson.videoType === "YOUTUBE" ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              <span className="inline-flex rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
                                YouTube видео
                              </span>
                              {((lesson.startTimeSeconds ?? 0) > 0 || (lesson.endTimeSeconds ?? 0) > 0) && (
                                <span className="inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                                  {(lesson.startTimeSeconds ?? 0) > 0 ? `${lesson.startTimeSeconds}s` : "0s"}–{(lesson.endTimeSeconds ?? 0) > 0 ? `${lesson.endTimeSeconds}s` : "end"}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>

                        {/* Active type icon */}
                        {isActive && (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100">
                            <Icon size={9} className="text-violet-600" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
