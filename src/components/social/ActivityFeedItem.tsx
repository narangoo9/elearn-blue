"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Trophy, Flame, Star, Zap, BookOpen,
  Award, Target, Users, CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import { useSocialStore } from "@/stores/social-store";
import type { ActivityFeedItem as FeedItem, ActivityComment } from "@/lib/realtime/social";

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  COURSE_COMPLETED:    { icon: Trophy,       color: "text-amber-400",  label: "completed a course" },
  LESSON_COMPLETED:    { icon: BookOpen,     color: "text-sky-400",    label: "finished a lesson" },
  BADGE_EARNED:        { icon: Award,        color: "text-violet-400", label: "earned a badge" },
  STREAK_MILESTONE:    { icon: Flame,        color: "text-orange-400", label: "hit a streak milestone" },
  LEVEL_UP:            { icon: Star,         color: "text-yellow-400", label: "leveled up" },
  XP_MILESTONE:        { icon: Zap,          color: "text-emerald-400",label: "reached an XP milestone" },
  LEADERBOARD_TOP:     { icon: Trophy,       color: "text-amber-400",  label: "entered the top 10" },
  QUIZ_PERFECT:        { icon: Target,       color: "text-pink-400",   label: "got a perfect quiz score" },
  CERTIFICATE_EARNED:  { icon: CheckCircle2, color: "text-emerald-400",label: "earned a certificate" },
  FINAL_TASK_COMPLETED:{ icon: CheckCircle2, color: "text-teal-400",   label: "completed a final task" },
  JOINED_GROUP:        { icon: Users,        color: "text-cyan-400",   label: "joined a study group" },
};

interface Props {
  item: FeedItem;
  currentUserId: string;
}

export function ActivityFeedItem({ item, currentUserId }: Props) {
  const { toggleFeedLike } = useSocialStore();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(item.likes.some((l) => l.userId === currentUserId));
  const [likeCount, setLikeCount] = useState(item._count.likes);
  const [likeAnim, setLikeAnim] = useState(false);

  const config = ACTIVITY_CONFIG[item.type] ?? { icon: Star, color: "text-slate-400", label: "did something" };
  const Icon = config.icon;
  const data = item.data as Record<string, string>;

  async function handleLike() {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    toggleFeedLike(item.id, currentUserId);
    await fetch(`/api/v1/activity-feed/${item.id}/like`, { method: "POST" });
  }

  async function loadComments() {
    if (loadingComments || comments.length > 0) { setShowComments(true); return; }
    setLoadingComments(true);
    const res = await fetch(`/api/v1/activity-feed/${item.id}/comment`);
    const data = await res.json();
    setComments(data.comments ?? []);
    setLoadingComments(false);
    setShowComments(true);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/v1/activity-feed/${item.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) {
      const { comment } = await res.json();
      setComments((c) => [...c, comment]);
      setCommentText("");
    }
    setSubmitting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 hover:bg-white/[0.05] transition-colors"
    >
      <div className="flex gap-3">
        <UserAvatar src={item.user.avatarUrl} name={item.user.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200">{item.user.name}</span>
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className="text-sm text-slate-400">{config.label}</span>
            {data.courseTitle && (
              <span className="text-sm font-medium text-sky-400 truncate max-w-[180px]">
                {data.courseTitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-600">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
            {data.level && <span className="text-xs text-yellow-400 font-semibold">Level {data.level}</span>}
            {data.streak && <span className="text-xs text-orange-400 font-semibold">{data.streak} days 🔥</span>}
            {data.xp && <span className="text-xs text-emerald-400 font-semibold">{data.xp} XP ⚡</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <motion.button
              onClick={handleLike}
              animate={likeAnim ? { scale: [1, 1.4, 1] } : {}}
              className={cn("flex items-center gap-1.5 text-xs transition-colors", liked ? "text-rose-400" : "text-slate-500 hover:text-rose-400")}
            >
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-rose-400")} />
              {likeCount > 0 && likeCount}
            </motion.button>
            <button
              onClick={loadComments}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-400 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {item._count.comments > 0 && item._count.comments}
            </button>
          </div>

          {/* Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {loadingComments && <p className="text-xs text-slate-500">Loading…</p>}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <UserAvatar src={c.user.avatarUrl} name={c.user.name} size="xs" />
                    <div className="flex-1 bg-white/[0.04] rounded-xl px-3 py-1.5">
                      <p className="text-[11px] font-semibold text-slate-300">{c.user.name}</p>
                      <p className="text-xs text-slate-400">{c.content}</p>
                    </div>
                  </div>
                ))}
                <form onSubmit={submitComment} className="flex gap-2 mt-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    className="text-xs px-3 py-1.5 bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold"
                  >
                    Post
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
