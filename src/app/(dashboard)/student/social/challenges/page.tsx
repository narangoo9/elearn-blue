"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Plus, X, BookOpen, Flame, Zap, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { ChallengeCard } from "@/components/social/ChallengeCard";
import { cn } from "@/lib/utils";

type TabType = "active" | "incoming" | "mine";

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<TabType>("active");
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/v1/challenges?type=${tab}`);
    const data = await res.json();
    setChallenges(data.challenges ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  async function respond(id: string, action: "accept" | "decline") {
    await fetch(`/api/v1/challenges/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  }

  const TABS: { key: TabType; label: string }[] = [
    { key: "active",   label: "Active" },
    { key: "incoming", label: "Incoming" },
    { key: "mine",     label: "All Mine" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sword className="w-5 h-5 text-sky-400" />
          Challenges
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Create
        </button>
      </div>

      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
              tab === key ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/[0.03] border border-white/[0.07] animate-pulse" />
          ))
        ) : challenges.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Sword className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm">
              {tab === "incoming" ? "No pending challenges" : "No challenges yet — create one!"}
            </p>
          </div>
        ) : (
          challenges.map((c, i) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              currentUserId={session?.user?.id ?? ""}
              onRespond={tab === "incoming" ? respond : undefined}
              index={i}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {showCreate && session?.user && (
          <CreateChallengeModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} currentUserId={session.user.id} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateChallengeModal({ onClose, onCreated, currentUserId }: { onClose: () => void; onCreated: () => void; currentUserId: string }) {
  const [form, setForm] = useState({ title: "", type: "XP_BATTLE", targetValue: "100", challengedUserId: "", endsAt: "", xpReward: "50" });
  const [loading, setLoading] = useState(false);

  const TYPES = [
    { value: "XP_BATTLE",     label: "XP Battle",     icon: Zap },
    { value: "LESSONS_COUNT", label: "Lesson Count",  icon: BookOpen },
    { value: "STREAK_DAYS",   label: "Streak Days",   icon: Flame },
    { value: "QUIZ_SPEED",    label: "Quiz Speed",    icon: Clock },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.endsAt) return;
    setLoading(true);
    await fetch("/api/v1/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        type: form.type,
        targetValue: parseInt(form.targetValue),
        endsAt: form.endsAt,
        xpReward: parseInt(form.xpReward),
        challengedUserId: form.challengedUserId || undefined,
      }),
    });
    setLoading(false);
    onCreated();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 8 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sword className="w-5 h-5 text-sky-400" /> Create Challenge
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Beat me to 100 XP!" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, type: value })}
                  className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors",
                    form.type === value ? "bg-sky-500/20 border-sky-500/40 text-sky-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white")}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Target</label>
              <input type="number" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">XP Reward</label>
              <input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} min="10"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/50" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">End Date *</label>
            <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Challenge a user (optional — paste user ID)</label>
            <input value={form.challengedUserId} onChange={(e) => setForm({ ...form, challengedUserId: e.target.value })}
              placeholder="User ID…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
          </div>
          <button type="submit" disabled={loading || !form.title || !form.endsAt}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Sword className="w-4 h-4" /> Create Challenge</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
