"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AgentAction } from "@/lib/agent/agent-types";

interface Props {
  action: AgentAction;
  onNavigate?: () => void;
  onMessage?: (prompt: string) => void;
  disabled?: boolean;
}

export function AiAgentActionButton({ action, onNavigate, onMessage, disabled }: Props) {
  const base = cn(
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5",
    "text-[11px] font-semibold leading-none transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    action.variant === "primary"
      ? "bg-violet-600 text-white hover:bg-violet-500"
      : "border border-violet-200 bg-white text-violet-700 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800/50 dark:bg-white/5 dark:text-violet-300 dark:hover:bg-violet-900/20",
  );

  if (action.type === "navigate" && action.href) {
    return (
      <Link
        href={action.href}
        onClick={onNavigate}
        className={base}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <button
      onClick={() => action.prompt && onMessage?.(action.prompt)}
      disabled={disabled}
      className={cn(base, "cursor-pointer")}
    >
      {action.label}
    </button>
  );
}
