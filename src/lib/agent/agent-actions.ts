import type { AgentAction } from "./agent-types";

// ── Action builders ───────────────────────────────────────────────────────────

export function navigateAction(
  label: string,
  href: string,
  variant: AgentAction["variant"] = "primary",
): AgentAction {
  return { label, type: "navigate", href, variant };
}

export function messageAction(
  label: string,
  prompt: string,
  variant: AgentAction["variant"] = "secondary",
): AgentAction {
  return { label, type: "message", prompt, variant };
}

// ── Shared reusable actions ───────────────────────────────────────────────────

export const ACTION = {
  catalog: () => navigateAction("Catalog харах", "/student/catalog"),
  continueLearning: (courseId: string, lessonId?: string | null) =>
    navigateAction(
      "Үргэлжлүүлэх ▶",
      lessonId
        ? `/student/courses/${courseId}/learn?lessonId=${lessonId}`
        : `/student/courses/${courseId}/learn`,
    ),
  courseDetail: (courseId: string) =>
    navigateAction("Course дэлгэрэнгүй", `/student/courses/${courseId}`, "secondary"),
  studyPlan: () => messageAction("Study plan гаргах", "7 хоногийн study plan гарга"),
  myProgress: () => messageAction("Миний progress", "Миний progress харуул", "secondary"),
  certificateCheck: () =>
    messageAction("Certificate шалгах", "Certificate авахад юу дутуу вэ?", "secondary"),
} as const;
