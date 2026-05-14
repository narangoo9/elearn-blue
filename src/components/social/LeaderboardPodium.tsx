"use client";

import { motion } from "framer-motion";
import { Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import Link from "next/link";

export interface LeaderboardEntry {
  userId: string;
  totalXp: number;
  weeklyXp?: number;
  rank: number;
  user: { id: string; name: string; avatarUrl: string | null; username: string | null; level: number; streak: number };
}

interface PodiumProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  xpKey?: "totalXp" | "weeklyXp";
}

const PODIUM_STYLES = [
  // #2 silver
  { height: "h-20", bg: "from-slate-400 to-slate-500", ring: "ring-slate-300", medal: "🥈", textColor: "text-slate-200" },
  // #1 gold
  { height: "h-28", bg: "from-amber-400 to-yellow-500", ring: "ring-amber-400", medal: "🥇", textColor: "text-amber-100" },
  // #3 bronze
  { height: "h-14", bg: "from-orange-400 to-orange-500", ring: "ring-orange-400", medal: "🥉", textColor: "text-orange-100" },
];

export function LeaderboardPodium({ entries, currentUserId, xpKey = "totalXp" }: PodiumProps) {
  if (entries.length < 3) return null;
  const [second, first, third] = [entries[1], entries[0], entries[2]];
  const podiumOrder = [second, first, third];
  const positions = [2, 1, 3] as const;

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 py-4">
      {podiumOrder.map((entry, idx) => {
        const pos = positions[idx];
        const style = PODIUM_STYLES[idx];
        const isMe = entry.userId === currentUserId;
        const xp = (entry[xpKey] ?? entry.totalXp) as number;

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            {pos === 1 && (
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            )}

            <Link href={`/u/${entry.user.username ?? entry.user.id}`}>
              <UserAvatar
                src={entry.user.avatarUrl}
                name={entry.user.name}
                size={pos === 1 ? "xl" : "lg"}
                borderStyle={pos === 1 ? "gold" : pos === 2 ? "silver" : "default"}
                className={isMe ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900" : ""}
              />
            </Link>

            <p className="text-[11px] font-bold text-center text-slate-200 max-w-[70px] truncate leading-tight">
              {entry.user.name}
            </p>

            {/* Podium pillar */}
            <div className={cn("relative rounded-t-2xl flex flex-col items-center justify-center gap-0.5 w-20 shadow-lg", style.height, `bg-gradient-to-t ${style.bg}`)}>
              <span className="text-lg">{style.medal}</span>
              <div className="flex items-center gap-0.5">
                <Zap className={cn("w-2.5 h-2.5", style.textColor)} />
                <span className={cn("text-[10px] font-black", style.textColor)}>{xp.toLocaleString()}</span>
              </div>
              <span className={cn("text-[9px] opacity-80", style.textColor)}>Lv.{entry.user.level}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function LeaderboardRow({ entry, rank, currentUserId, xp }: { entry: LeaderboardEntry; rank: number; currentUserId: string; xp: number }) {
  const isMe = entry.userId === currentUserId;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors border",
        isMe
          ? "bg-violet-500/10 border-violet-500/30"
          : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0",
        rank === 1 ? "bg-amber-400/20 text-amber-400" :
        rank === 2 ? "bg-slate-400/20 text-slate-300" :
        rank === 3 ? "bg-orange-400/20 text-orange-400" :
        "bg-white/5 text-slate-500"
      )}>
        #{rank}
      </div>
      <Link href={`/u/${entry.user.username ?? entry.user.id}`}>
        <UserAvatar src={entry.user.avatarUrl} name={entry.user.name} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/u/${entry.user.username ?? entry.user.id}`} className={cn("text-sm font-semibold truncate block hover:text-sky-400 transition-colors", isMe ? "text-violet-300" : "text-slate-200")}>
          {entry.user.name}
          {isMe && <span className="ml-1 text-[9px] text-violet-400 font-black">YOU</span>}
        </Link>
        <p className="text-[10px] text-slate-500">Lv.{entry.user.level} · 🔥{entry.user.streak}d</p>
      </div>
      <div className="flex items-center gap-0.5">
        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span className="text-sm font-black text-amber-400">{xp.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
