"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame, Trophy, BookOpen, Star, Users, Award, MapPin } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/social/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";
import { ActivityFeedItem } from "@/components/social/ActivityFeedItem";
import type { ActivityFeedItem as FeedItem } from "@/lib/realtime/social";

type Tab = "activity" | "courses" | "badges" | "stats";

interface Badge { badge: string; earnedAt: string }
interface Course { id: string; title: string; slug: string; thumbnailUrl: string | null }
interface CompletedCourse { course: Course; completedAt: string | null }

interface Profile {
  id: string; name: string; username: string | null; avatarUrl: string | null;
  bio: string | null; level: number; xp: number; streak: number;
  skills: string[]; profileTheme: string | null; profileStatus: string | null;
  statusEmoji: string | null; profileBorder: string | null; createdAt: string;
  badges: Badge[];
  _count: { following: number; followers: number; enrollments: number };
}

interface Props {
  profile: Profile;
  isFollowing: boolean;
  completedCourses: CompletedCourse[];
  recentActivity: FeedItem[];
  currentUserId: string | null;
}

const BADGE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  FIRST_LESSON:  { label: "First Lesson",     color: "text-sky-400",    emoji: "📚" },
  FIRST_COURSE:  { label: "First Course",     color: "text-emerald-400",emoji: "🎓" },
  STREAK_7:      { label: "7-Day Streak",     color: "text-orange-400", emoji: "🔥" },
  STREAK_30:     { label: "30-Day Streak",    color: "text-orange-500", emoji: "🔥" },
  STREAK_100:    { label: "100-Day Streak",   color: "text-red-400",    emoji: "🔥" },
  QUIZ_MASTER:   { label: "Quiz Master",      color: "text-violet-400", emoji: "🧠" },
  SPEED_LEARNER: { label: "Speed Learner",    color: "text-cyan-400",   emoji: "⚡" },
  TOP_10:        { label: "Top 10",           color: "text-amber-400",  emoji: "🏆" },
  PERFECT_SCORE: { label: "Perfect Score",    color: "text-pink-400",   emoji: "💯" },
  EARLY_BIRD:    { label: "Early Bird",       color: "text-yellow-400", emoji: "🌅" },
  COURSE_CREATOR:{ label: "Course Creator",   color: "text-teal-400",   emoji: "✍️" },
};

export function ProfilePageClient({ profile, isFollowing, completedCourses, recentActivity, currentUserId }: Props) {
  const [tab, setTab] = useState<Tab>("activity");
  const isOwn = currentUserId === profile.id;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "activity", label: "Activity", icon: Zap },
    { key: "courses",  label: "Courses",  icon: BookOpen },
    { key: "badges",   label: "Badges",   icon: Award },
    { key: "stats",    label: "Stats",    icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero banner */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-slate-900 to-violet-900/60" />
        <div className="absolute inset-0 pointer-events-none">
          {[["15%","20%"],["35%","60%"],["65%","30%"],["80%","70%"],["50%","50%"]].map(([l,t],i) => (
            <div key={i} className="absolute w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-sky-400 to-violet-600 blur-2xl"
              style={{ left: l, top: t }} />
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Avatar + actions row */}
        <div className="flex items-end gap-4 -mt-12 mb-4 relative z-10">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.name}
            size="2xl"
            borderStyle={(profile.profileBorder as "gold" | "silver" | "diamond" | "fire" | "galaxy") ?? "default"}
            className="ring-4 ring-slate-950"
          />
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white truncate">{profile.name}</h1>
              {profile.statusEmoji && <span>{profile.statusEmoji}</span>}
            </div>
            {profile.username && <p className="text-sm text-slate-500">@{profile.username}</p>}
          </div>
          <div className="pb-2 flex gap-2">
            {!isOwn && currentUserId && (
              <FollowButton targetUserId={profile.id} initialFollowing={isFollowing} />
            )}
            {isOwn && (
              <Link href="/student/settings" className="px-4 py-2 text-sm font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Bio & status */}
        {profile.bio && <p className="text-sm text-slate-400 mb-3">{profile.bio}</p>}
        {profile.profileStatus && (
          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />{profile.profileStatus}
          </p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Level",     value: profile.level,                icon: Star,    color: "text-yellow-400" },
            { label: "XP",        value: profile.xp.toLocaleString(),  icon: Zap,     color: "text-emerald-400" },
            { label: "Streak",    value: `${profile.streak}d`,         icon: Flame,   color: "text-orange-400" },
            { label: "Courses",   value: profile._count.enrollments,   icon: Trophy,  color: "text-violet-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3 text-center">
              <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
              <p className="text-base font-black text-white">{value}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Followers row */}
        <div className="flex items-center gap-4 mb-5 text-sm text-slate-400">
          <span><span className="font-bold text-white">{profile._count.followers}</span> followers</span>
          <span><span className="font-bold text-white">{profile._count.following}</span> following</span>
          <span className="ml-auto text-xs text-slate-600">
            Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {profile.skills.map((skill) => (
              <span key={skill} className="text-xs px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 mb-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                tab === key ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-8">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : recentActivity.map((item) => (
                <ActivityFeedItem key={item.id} item={item} currentUserId={currentUserId ?? ""} />
              ))}
            </motion.div>
          )}

          {tab === "courses" && (
            <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 gap-3 pb-8">
              {completedCourses.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-500">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No completed courses yet</p>
                </div>
              ) : completedCourses.map(({ course }) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="flex gap-3 p-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:bg-white/[0.05] transition-colors">
                  {course.thumbnailUrl
                    ? <img src={course.thumbnailUrl} alt={course.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0"><BookOpen className="w-6 h-6 text-slate-500" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{course.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-semibold">Completed</span>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {tab === "badges" && (
            <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-8">
              {profile.badges.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-slate-500">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No badges yet</p>
                </div>
              ) : profile.badges.map(({ badge, earnedAt }) => {
                const info = BADGE_LABELS[badge] ?? { label: badge, color: "text-slate-400", emoji: "🏅" };
                return (
                  <div key={badge} className="flex flex-col items-center gap-2 p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-center">
                    <span className="text-3xl">{info.emoji}</span>
                    <p className={cn("text-xs font-bold", info.color)}>{info.label}</p>
                    <p className="text-[10px] text-slate-600">{formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}</p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-8">
              {[
                { label: "Total XP",          value: profile.xp.toLocaleString(),         icon: Zap,     color: "text-emerald-400" },
                { label: "Current Level",     value: profile.level,                       icon: Star,    color: "text-yellow-400" },
                { label: "Current Streak",    value: `${profile.streak} days`,            icon: Flame,   color: "text-orange-400" },
                { label: "Courses Completed", value: profile._count.enrollments,          icon: Trophy,  color: "text-violet-400" },
                { label: "Badges Earned",     value: profile.badges.length,               icon: Award,   color: "text-pink-400" },
                { label: "Followers",         value: profile._count.followers,            icon: Users,   color: "text-sky-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", color)} />
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                  <span className={cn("text-sm font-black", color)}>{value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
