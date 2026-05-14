"use client";

import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type BorderStyle = "default" | "gold" | "silver" | "diamond" | "fire" | "galaxy";

const SIZE_MAP: Record<AvatarSize, string> = {
  xs:  "w-6 h-6 text-[9px]",
  sm:  "w-8 h-8 text-[10px]",
  md:  "w-10 h-10 text-xs",
  lg:  "w-12 h-12 text-sm",
  xl:  "w-16 h-16 text-base",
  "2xl": "w-20 h-20 text-lg",
};

const BORDER_MAP: Record<BorderStyle, string> = {
  default: "ring-2 ring-white/10",
  gold:    "ring-2 ring-amber-400 shadow-amber-400/40 shadow-lg",
  silver:  "ring-2 ring-slate-300 shadow-slate-300/40 shadow-md",
  diamond: "ring-2 ring-cyan-400 shadow-cyan-400/40 shadow-lg",
  fire:    "ring-2 ring-orange-500 shadow-orange-500/40 shadow-lg",
  galaxy:  "ring-2 ring-purple-500 shadow-purple-500/40 shadow-lg",
};

const ONLINE_SIZE: Record<AvatarSize, string> = {
  xs:  "w-1.5 h-1.5 border",
  sm:  "w-2 h-2 border",
  md:  "w-2.5 h-2.5 border",
  lg:  "w-3 h-3 border-2",
  xl:  "w-3.5 h-3.5 border-2",
  "2xl": "w-4 h-4 border-2",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

interface Props {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  borderStyle?: BorderStyle;
  isOnline?: boolean;
  className?: string;
}

export function UserAvatar({ src, name, size = "md", borderStyle = "default", isOnline, className }: Props) {
  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div className={cn("rounded-full overflow-hidden bg-gradient-to-br from-sky-600 to-violet-600 flex items-center justify-center font-bold text-white", SIZE_MAP[size], BORDER_MAP[borderStyle])}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {isOnline && (
        <span className={cn("absolute bottom-0 right-0 rounded-full bg-emerald-400 border-slate-900", ONLINE_SIZE[size])} />
      )}
    </div>
  );
}
