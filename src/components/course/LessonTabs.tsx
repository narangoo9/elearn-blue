"use client";

import { useState } from "react";
import {
  BookOpen,
  StickyNote,
  FolderOpen,
  CheckSquare,
  CheckCircle2,
  Target,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonType } from "@prisma/client";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
}

type TabId = "overview" | "notes" | "resources" | "task";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Тойм", icon: BookOpen },
  { id: "notes", label: "Тэмдэглэл", icon: StickyNote },
  { id: "resources", label: "Материал", icon: FolderOpen },
  { id: "task", label: "Даалгавар", icon: CheckSquare },
];

function OverviewTab({ lesson }: { lesson: Lesson }) {
  const summary =
    lesson.description ??
    "Энэ хичээл чухал ойлголтуудыг авч үзнэ. Сайтар дагаж, дасгалуудыг хийж гүйцэтгэснээр материалыг бүрэн эзэмшинэ.";

  const goals = [
    "Хичээлийн үндсэн ойлголтуудыг ойлгох",
    "Практик дасгалаар мэдлэгээ бататгах",
    "Даалгавар болон шалгалтуудыг дүүргэх",
    "Дараагийн хичээлд итгэлтэйгээр шилжих",
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Summary card */}
      <div className="rounded-2xl border border-violet-100/70 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
            <BookOpen size={13} className="text-violet-600" />
          </div>
          <h3 className="text-[13px] font-bold text-slate-700">Хичээлийн тойм</h3>
        </div>
        <p className="text-[12px] leading-relaxed text-slate-500">{summary}</p>
      </div>

      {/* Goals card */}
      <div className="rounded-2xl border border-purple-100/70 bg-purple-50/40 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
            <Target size={13} className="text-purple-600" />
          </div>
          <h3 className="text-[13px] font-bold text-slate-700">Хичээлийн зорилго</h3>
        </div>
        <ul className="space-y-2">
          {goals.map((goal, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-purple-500" />
              <span className="text-[12px] text-slate-600">{goal}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: "violet" | "blue" | "emerald";
}) {
  const colors = {
    violet: { bg: "bg-violet-100", icon: "text-violet-500", border: "border-violet-200" },
    blue: { bg: "bg-blue-100", icon: "text-blue-500", border: "border-blue-200" },
    emerald: { bg: "bg-emerald-100", icon: "text-emerald-500", border: "border-emerald-200" },
  };
  const c = colors[color];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white py-12 text-center",
        c.border,
      )}
    >
      <div className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-2xl", c.bg)}>
        <Icon size={20} className={c.icon} />
      </div>
      <p className="text-[13px] font-bold text-slate-700">{title}</p>
      <p className="mt-1 text-[12px] text-slate-400">{subtitle}</p>
    </div>
  );
}

function TaskTab({ lesson }: { lesson: Lesson }) {
  const isActionable = lesson.type === "ASSIGNMENT" || lesson.type === "QUIZ";

  if (!isActionable) {
    return (
      <EmptyState
        icon={CheckSquare}
        color="emerald"
        title="Энэ хичээлд даалгавар байхгүй"
        subtitle="Хичээлийн агуулгыг дуусгаад үргэлжлүүлнэ үү"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
          <CheckSquare size={14} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-700">
            {lesson.type === "QUIZ" ? "Шалгалт" : "Даалгавар"}
          </p>
          <p className="text-[11px] text-slate-400">{lesson.title}</p>
        </div>
      </div>
      <p className="mb-4 text-[12px] leading-relaxed text-slate-500">
        {lesson.type === "QUIZ"
          ? "Мэдлэгээ шалгалтаар баталгаажуул. Хэдэн ч удаа давтаж өгч болно."
          : "Хичээлийн материалыг ойлгосноо энэ даалгавараар харуул."}
      </p>
      <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700">
        <CheckSquare size={13} />
        {lesson.type === "QUIZ" ? "Шалгалт эхлүүлэх" : "Даалгавар эхлүүлэх"}
      </button>
    </div>
  );
}

export function LessonTabs({ lesson }: { lesson: Lesson }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-violet-100">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[12px] font-semibold transition-colors",
              activeTab === id
                ? "border-violet-600 text-violet-700"
                : "border-transparent text-slate-400 hover:text-slate-600",
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-4">
        {activeTab === "overview" && <OverviewTab lesson={lesson} />}
        {activeTab === "notes" && (
          <EmptyState
            icon={StickyNote}
            color="violet"
            title="Тэмдэглэл алга"
            subtitle="Хичээлийн тэмдэглэлүүд энд харагдана"
          />
        )}
        {activeTab === "resources" && (
          <EmptyState
            icon={Link2}
            color="blue"
            title="Материал алга"
            subtitle="Нэмэлт материалууд энд харагдана"
          />
        )}
        {activeTab === "task" && <TaskTab lesson={lesson} />}
      </div>
    </div>
  );
}
