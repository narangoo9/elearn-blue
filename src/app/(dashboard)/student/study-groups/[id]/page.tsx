"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, Target, Send, CheckCircle2, Circle, Plus, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/social/UserAvatar";
import { useSocialStore } from "@/stores/social-store";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type TabType = "chat" | "goals" | "members";

interface GroupMember {
  id: string; name: string; username?: string | null; avatarUrl?: string | null;
  level: number; xp: number; role?: string;
}

interface StudyGroup {
  id: string; name: string; description?: string | null; imageUrl?: string | null;
  tags: string[]; isPublic: boolean; maxMembers: number;
  creator: { id: string; name: string };
  members: (GroupMember & { role: string; joinedAt: string })[];
  _count: { members: number };
}

interface Goal {
  id: string; title: string; description?: string | null;
  dueDate?: string | null; isCompleted: boolean; completedAt?: string | null;
}

export default function StudyGroupRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [tab, setTab] = useState<TabType>("chat");
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { groupMessages, appendGroupMessage, prependGroupMessages, markGroupRead } = useSocialStore();
  const messages = groupMessages[id] ?? [];

  const loadGroup = useCallback(async () => {
    const res = await fetch(`/api/v1/study-groups?type=mine`);
    const data = await res.json();
    const found = data.groups?.find((g: StudyGroup) => g.id === id);
    if (found) setGroup(found);
    setGroupLoading(false);
  }, [id]);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/v1/study-groups/${id}/messages`);
    const data = await res.json();
    if (data.messages) prependGroupMessages(id, data.messages);
    markGroupRead(id);
  }, [id, prependGroupMessages, markGroupRead]);

  const loadGoals = useCallback(async () => {
    const res = await fetch(`/api/v1/study-groups/${id}/goals`);
    const data = await res.json();
    setGoals(data.goals ?? []);
  }, [id]);

  useEffect(() => {
    loadGroup();
    loadMessages();
    loadGoals();
  }, [loadGroup, loadMessages, loadGoals]);

  useEffect(() => {
    if (tab === "chat") messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || sending) return;
    const text = messageText;
    setMessageText("");
    setSending(true);
    const res = await fetch(`/api/v1/study-groups/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      const { message } = await res.json();
      appendGroupMessage(id, message);
    }
    setSending(false);
  }

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setAddingGoal(true);
    const res = await fetch(`/api/v1/study-groups/${id}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGoal.trim() }),
    });
    if (res.ok) { await loadGoals(); setNewGoal(""); }
    setAddingGoal(false);
  }

  async function toggleGoal(goalId: string, isCompleted: boolean) {
    await fetch(`/api/v1/study-groups/${id}/goals`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, isCompleted }),
    });
    setGoals((g) => g.map((goal) => goal.id === goalId ? { ...goal, isCompleted } : goal));
  }

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] bg-slate-900/50 backdrop-blur-sm">
        <Link href="/student/study-groups" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600/30 to-violet-600/20 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-white text-sm truncate">{group?.name ?? "Study Group"}</h1>
          <p className="text-xs text-slate-500">{group?._count?.members ?? 0} members</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-0.5">
          {([
            { key: "chat" as const,    icon: MessageCircle },
            { key: "goals" as const,   icon: Target },
            { key: "members" as const, icon: Users },
          ]).map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn("w-8 h-7 flex items-center justify-center rounded-lg transition-all",
                tab === key ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white")}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No messages yet — say hello!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.user.id === session?.user?.id;
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-2.5", isMe && "flex-row-reverse")}>
                      {!isMe && <UserAvatar src={msg.user.avatarUrl} name={msg.user.name} size="sm" />}
                      <div className={cn("max-w-xs lg:max-w-md", isMe && "items-end flex flex-col")}>
                        {!isMe && <p className="text-[10px] text-slate-500 mb-0.5 ml-1">{msg.user.name}</p>}
                        <div className={cn("px-3 py-2 rounded-2xl text-sm leading-relaxed",
                          isMe ? "bg-sky-500 text-white rounded-tr-sm" : "bg-white/[0.06] text-slate-200 rounded-tl-sm")}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5 mx-1">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-white/[0.07] flex gap-2">
                <input value={messageText} onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Message the group…"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
                <button type="submit" disabled={!messageText.trim() || sending}
                  className="w-10 h-10 flex items-center justify-center bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {tab === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full overflow-y-auto px-4 py-4 space-y-3">
              <form onSubmit={addGoal} className="flex gap-2">
                <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a group goal…"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
                <button type="submit" disabled={!newGoal.trim() || addingGoal}
                  className="w-10 h-10 flex items-center justify-center bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
              {goals.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Add goals to keep your group on track</p>
                </div>
              ) : goals.map((goal, i) => (
                <motion.div key={goal.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn("flex items-start gap-3 p-3.5 rounded-xl border transition-colors",
                    goal.isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.07]")}>
                  <button onClick={() => toggleGoal(goal.id, !goal.isCompleted)}
                    className={cn("flex-shrink-0 mt-0.5", goal.isCompleted ? "text-emerald-400" : "text-slate-500 hover:text-sky-400")}>
                    {goal.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", goal.isCompleted ? "line-through text-slate-500" : "text-slate-200")}>
                      {goal.title}
                    </p>
                    {goal.dueDate && (
                      <p className="text-xs text-slate-500 mt-0.5">Due {formatDistanceToNow(new Date(goal.dueDate), { addSuffix: true })}</p>
                    )}
                  </div>
                  {goal.isCompleted && <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "members" && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full overflow-y-auto px-4 py-4 space-y-2">
              {(group?.members ?? []).map((member, i) => (
                <motion.div key={member.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <UserAvatar src={member.avatarUrl} name={member.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${member.username ?? member.id}`} className="text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors block truncate">
                      {member.name}
                    </Link>
                    <p className="text-xs text-slate-500">Level {member.level}</p>
                  </div>
                  {member.role && (
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      member.role === "OWNER" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      member.role === "ADMIN" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" :
                      "bg-white/5 text-slate-500 border border-white/10")}>
                      {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
