"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AgentAction } from "@/lib/agent/agent-types";
import { AiAgentButton } from "@/components/ai-agent/AiAgentButton";
import { AiAgentPanel } from "@/components/ai-agent/AiAgentPanel";
import type { ChatMessage } from "@/components/ai-agent/AiAgentMessage";

// ── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "edunity-ai-agent-chat";
const MAX_HISTORY = 50;

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
  } catch {
    // ignore quota errors
  }
}

// ── Page context ──────────────────────────────────────────────────────────────

function getPageContext(pathname: string): string {
  if (pathname === "/student" || pathname === "/student/") return "dashboard";
  if (pathname.startsWith("/student/courses")) return "lessons";
  if (pathname.startsWith("/student/catalog")) return "catalog";
  if (pathname.startsWith("/student/progress")) return "skill-graph";
  if (pathname.startsWith("/student/leaderboard")) return "leaderboard";
  if (pathname.startsWith("/student/upgrade")) return "pricing";
  return "dashboard";
}

function getCourseIdFromPath(pathname: string): string | undefined {
  const m = pathname.match(/\/courses\/([^/]+)/);
  return m?.[1];
}

function getLessonIdFromPath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get("lessonId") ?? undefined;
}

// ── Main component ────────────────────────────────────────────────────────────

interface RoboAgentProps {
  firstName?: string;
  level?: number;
  xp?: number;
  streak?: number;
}

export function RoboAgent({
  firstName = "Student",
  level = 1,
  xp = 0,
  streak = 0,
}: RoboAgentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [latestAssistantId, setLatestAssistantId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pageContext = getPageContext(pathname);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
      return () => clearTimeout(t);
    }
  }, [open, messages, loading]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setShowQuickActions(false);
      setLatestAssistantId(null);

      try {
        const res = await fetch("/api/ai-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            pageContext,
            courseId: getCourseIdFromPath(pathname),
            lessonId: getLessonIdFromPath(),
          }),
        });

        const data = (await res.json()) as {
          reply?: string;
          actions?: AgentAction[];
          suggestions?: string[];
          mode?: string;
        };

        const reply = data.reply ?? "Уучлаарай, хариу авч чадсангүй. Дахин оролдоно уу.";
        const newId = crypto.randomUUID();
        setLatestAssistantId(newId);
        setMessages((prev) => [
          ...prev,
          {
            id: newId,
            role: "assistant",
            content: reply,
            timestamp: Date.now(),
            actions: data.actions ?? [],
            suggestions: data.suggestions ?? [],
          },
        ]);
      } catch {
        const errId = crypto.randomUUID();
        setLatestAssistantId(errId);
        setMessages((prev) => [
          ...prev,
          {
            id: errId,
            role: "assistant",
            content:
              "Уучлаарай, AI Agent түр ажиллахгүй байна. Гэхдээ чи өнөөдөр нэг хичээлээ үргэлжлүүлэхийг санал болгож байна 🔥",
            timestamp: Date.now(),
            actions: [
              {
                label: "Хичээл харах",
                type: "navigate",
                href: "/student/courses",
                variant: "primary",
              },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, pageContext, pathname],
  );

  const handleSend = () => sendMessage(input);
  const handleQuickAction = (prompt: string) => sendMessage(prompt);
  const clearChat = () => {
    setMessages([]);
    setLatestAssistantId(null);
    setShowQuickActions(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Panel spring transition
  const panelTransition = shouldReduce
    ? { duration: 0.15 }
    : { type: "spring" as const, damping: 28, stiffness: 340 };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-[2px] sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── AI Agent Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: panelTransition }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.14, ease: "easeIn" } }}
            role="dialog"
            aria-modal="true"
            aria-label="EduNity AI Agent"
            className={cn(
              "fixed z-[9995] flex flex-col overflow-hidden",
              "border border-violet-200/80 bg-white dark:border-violet-800/40 dark:bg-[#0f0c1f]",
              "shadow-2xl shadow-violet-500/20 dark:shadow-violet-900/30",
              // Desktop: right panel above button
              "bottom-[88px] right-5 w-[360px] max-h-[calc(100vh-112px)] rounded-3xl",
              // Mobile: bottom sheet
              "max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:max-h-[88vh] max-sm:rounded-t-3xl max-sm:rounded-b-none",
            )}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-0.5 sm:hidden" aria-hidden="true">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>

            <AiAgentPanel
              firstName={firstName.split(" ")[0]}
              level={level}
              xp={xp}
              streak={streak}
              messages={messages}
              loading={loading}
              input={input}
              showQuickActions={showQuickActions}
              pageContext={pageContext}
              latestAssistantId={latestAssistantId}
              onClose={() => setOpen(false)}
              onSend={handleSend}
              onInputChange={setInput}
              onQuickAction={handleQuickAction}
              onMessage={sendMessage}
              onClearChat={clearChat}
              onToggleQuickActions={() => setShowQuickActions((v) => !v)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ─────────────────────────────────────────────── */}
      <AiAgentButton open={open} onClick={() => setOpen((v) => !v)} />
    </>
  );
}
