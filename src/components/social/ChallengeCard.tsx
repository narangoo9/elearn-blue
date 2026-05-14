"use client";

import { motion } from "framer-motion";
import { BookOpen, Flame, Zap, Clock, Trophy, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

interface Participant {
  user: { id: string; name: string; avatarUrl: string | null };
  progress: number;
  isCompleted: boolean;
}

interface Challenge {
  id: string;
  title: string;
  type: string;
  status: string;
  targetValue: number;
  endsAt: string;
  xpReward: number;
  creator: { id: string; name: string; avatarUrl: string | null; level: number };
  participants: Participant[];
}

interface Props {
  challenge: Challenge;
  currentUserId: string;
  onRespond?: (id: string, action: "accept" | "decline") => void;
  index?: number;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  LESSONS_COUNT: { icon: BookOpen, color: "text-sky-400",    label: "lessons" },
  STREAK_DAYS:   { icon: Flame,    color: "text-orange-400", label: "streak days" },
  XP_BATTLE:     { icon: Zap,      color: "text-yellow-400", label: "XP" },
  QUIZ_SPEED:    { icon: Clock,    color: "text-violet-400", label: "quizzes" },
};

export function ChallengeCard({ challenge, currentUserId, onRespond, index = 0 }: Props) {
  const config = TYPE_CONFIG[challenge.type] ?? TYPE_CONFIG.XP_BATTLE;
  const Icon = config.icon;
  const myParticipation = challenge.participants.find((p) => p.user.id === currentUserId);
  const progress = myParticipation ? (myParticipation.progress / challenge.targetValue) * 100 : 0;
  const isExpired = new Date(challenge.endsAt) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0", config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">{challenge.title}</p>
          <p className="text-xs text-slate-500">
            {challenge.targetValue} {config.label} · {isExpired ? "Ended" : formatDistanceToNow(new Date(challenge.endsAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-black text-amber-400">{challenge.xpReward}</span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {challenge.participants.slice(0, 4).map((p) => (
            <UserAvatar key={p.user.id} src={p.user.avatarUrl} name={p.user.name} size="xs" className="ring-1 ring-slate-900" />
          ))}
        </div>
        <span className="text-[10px] text-slate-500">{challenge.participants.length} participants</span>
        {challenge.creator.id !== currentUserId && (
          <span className="text-[10px] text-slate-500 ml-auto">by {challenge.creator.name}</span>
        )}
      </div>

      {/* Progress bar */}
      {myParticipation && challenge.status === "ACTIVE" && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Progress</span>
            <span>{myParticipation.progress}/{challenge.targetValue}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Accept / Decline for PENDING */}
      {challenge.status === "PENDING" && challenge.creator.id !== currentUserId && onRespond && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onRespond(challenge.id, "accept")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Accept
          </button>
          <button
            onClick={() => onRespond(challenge.id, "decline")}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Decline
          </button>
        </div>
      )}

      {/* Status badge */}
      <div className="flex justify-end">
        <span className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
          challenge.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" :
          challenge.status === "PENDING" ? "bg-amber-500/10 text-amber-400" :
          challenge.status === "COMPLETED" ? "bg-violet-500/10 text-violet-400" :
          "bg-white/5 text-slate-500"
        )}>
          {challenge.status}
        </span>
      </div>
    </motion.div>
  );
}
