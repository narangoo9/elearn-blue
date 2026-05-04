"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, Lock } from "lucide-react";
import { enrollCourse } from "@/modules/courses/application/actions";
import { toast } from "@/components/ui/toaster";

interface EnrollButtonProps {
  courseId: string;
  hasCourseAccess: boolean;
}

export function EnrollButton({ courseId, hasCourseAccess }: EnrollButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const result = await enrollCourse({ courseId });

      if (result && "error" in result) {
        toast({ type: "error", title: "Алдаа", description: result.error as string });
        return;
      }

      if (result && "requiresUpgrade" in result) {
        toast({
          type: "info",
          title: "Upgrade шаардлагатай",
          description: "Энэ хичээлийг үзэхийн тулд Premium эсвэл Pro план авна уу.",
        });
        router.push("/student/upgrade");
        return;
      }
    } catch {
      toast({ type: "error", title: "Алдаа гарлаа", description: "Дахин оролдоно уу" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-500 active:scale-[.99] transition-all disabled:opacity-60"
    >
      {loading ? (
        <><Loader2 size={16} className="animate-spin" /> Бүртгэж байна...</>
      ) : hasCourseAccess ? (
        <><BookOpen size={16} /> Курст бүртгүүлэх</>
      ) : (
        <><Lock size={16} /> Upgrade хийж нэвтрэх</>
      )}
    </button>
  );
}
