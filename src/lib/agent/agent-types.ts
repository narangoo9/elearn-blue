// ── Core intent enum ─────────────────────────────────────────────────────────

export type AgentIntent =
  | "CONTINUE_LEARNING"
  | "RECOMMEND_COURSE"
  | "EXPLAIN_PROGRESS"
  | "CERTIFICATE_STATUS"
  | "CREATE_STUDY_PLAN"
  | "FIND_COURSE"
  | "TASK_HELP"
  | "LESSON_HELP"
  | "GENERAL_HELP";

// ── Action types ──────────────────────────────────────────────────────────────

export interface AgentAction {
  label: string;
  /** "navigate" → router.push(href)  |  "message" → send prompt as chat input */
  type: "navigate" | "message";
  href?: string;
  prompt?: string;
  variant?: "primary" | "secondary";
}

// ── Agent response ────────────────────────────────────────────────────────────

export interface AgentResponse {
  message: string;
  intent: AgentIntent;
  actions?: AgentAction[];
  suggestions?: string[];
  mode: "rule-based" | "ai" | "fallback";
}

// ── Context types ─────────────────────────────────────────────────────────────

export interface EnrolledCourseInfo {
  id: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  /** 0-100 */
  progress: number;
  lastLessonId: string | null;
  lastLessonTitle: string | null;
  moduleCount: number;
  hasCertificate: boolean;
}

export interface CertificateInfo {
  courseId: string;
  courseTitle: string | null;
  issuedAt: Date;
}

export interface AgentContext {
  userId: string | null;
  userName: string | null;
  level: number;
  xp: number;
  streak: number;
  enrolledCourses: EnrolledCourseInfo[];
  /** Most recently accessed enrolled course */
  activeCourse: EnrolledCourseInfo | null;
  /** Weighted average progress across all enrolled courses (0-100) */
  overallProgress: number;
  totalCompletedLessons: number;
  totalLessons: number;
  certificates: CertificateInfo[];
  pageContext?: string;
  courseId?: string;
  lessonId?: string;
}
