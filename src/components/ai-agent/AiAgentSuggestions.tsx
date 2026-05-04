"use client";

import { cn } from "@/lib/utils";

interface Props {
  chips: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AiAgentSuggestions({ chips, onSelect, disabled, className }: Props) {
  if (!chips.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className={cn(
            "rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1",
            "text-[11px] font-medium text-violet-700 transition-colors duration-150",
            "cursor-pointer hover:border-violet-400 hover:bg-violet-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-violet-800/40 dark:bg-violet-900/10 dark:text-violet-300 dark:hover:bg-violet-900/30",
          )}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
