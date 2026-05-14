"use client";

import { motion } from "framer-motion";
import { Users, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

interface StudyGroup {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  tags: string[];
  maxMembers: number;
  isPublic: boolean;
  memberCount: number;
  creator: { name: string; avatarUrl?: string | null };
  myMembership?: { role: string } | null;
}

interface Props {
  group: StudyGroup;
  onJoin?: () => void;
  isJoining?: boolean;
  index?: number;
}

const TAG_COLORS = [
  "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
];

export function StudyGroupCard({ group, onJoin, isJoining, index = 0 }: Props) {
  const fillPercent = Math.min(100, (group.memberCount / group.maxMembers) * 100);
  const isMember = !!group.myMembership;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/[0.05] transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600/30 to-violet-600/20 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-200 truncate">{group.name}</p>
            {group.isPublic
              ? <Globe className="w-3 h-3 text-slate-500 flex-shrink-0" />
              : <Lock className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          </div>
          {group.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{group.description}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {group.tags.slice(0, 3).map((tag, i) => (
            <span key={tag} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", TAG_COLORS[i % TAG_COLORS.length])}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Member fill bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <UserAvatar src={group.creator.avatarUrl} name={group.creator.name} size="xs" />
            <span>{group.creator.name}</span>
          </div>
          <span>{group.memberCount}/{group.maxMembers} members</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full" style={{ width: `${fillPercent}%` }} />
        </div>
      </div>

      {/* Action */}
      {isMember ? (
        <Link
          href={`/student/study-groups/${group.id}`}
          className="w-full text-center py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-semibold hover:bg-sky-500/20 transition-colors"
        >
          Open Group
        </Link>
      ) : (
        <button
          onClick={onJoin}
          disabled={isJoining || group.memberCount >= group.maxMembers}
          className="w-full py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          {isJoining ? (
            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Users className="w-3 h-3" />
              {group.memberCount >= group.maxMembers ? "Full" : "Join Group"}
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
