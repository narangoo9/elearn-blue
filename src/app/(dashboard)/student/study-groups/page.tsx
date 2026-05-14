"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Globe, Lock, X } from "lucide-react";
import { StudyGroupCard } from "@/components/social/StudyGroupCard";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type TabType = "discover" | "mine";

interface StudyGroup {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  tags: string[];
  maxMembers: number;
  isPublic: boolean;
  memberCount: number;
  messageCount?: number;
  creator: { name: string; avatarUrl?: string | null };
  myMembership?: { role: string } | null;
}

export default function StudyGroupsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("discover");
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: tab === "mine" ? "mine" : "public" });
      if (search) params.set("q", search);
      const res = await fetch(`/api/v1/study-groups?${params}`);
      const data = await res.json();
      setGroups(data.groups ?? []);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  async function joinGroup(groupId: string) {
    setJoiningId(groupId);
    const res = await fetch(`/api/v1/study-groups/${groupId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });
    if (res.ok) {
      await loadGroups();
      router.push(`/student/study-groups/${groupId}`);
    }
    setJoiningId(null);
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          Study Groups
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Group
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          <button onClick={() => setTab("discover")}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              tab === "discover" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-slate-200")}>
            <Globe className="w-3.5 h-3.5" /> Discover
          </button>
          <button onClick={() => setTab("mine")}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
              tab === "mine" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-slate-200")}>
            <Users className="w-3.5 h-3.5" /> My Groups
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups…"
            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [0,1,2,3,4,5].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-white/[0.03] border border-white/[0.07] animate-pulse" />
          ))
        ) : groups.length === 0 ? (
          <div className="col-span-3 text-center py-16">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">
              {tab === "mine" ? "You haven't joined any groups yet" : "No groups found"}
            </p>
          </div>
        ) : (
          groups.map((group, i) => (
            <StudyGroupCard
              key={group.id}
              group={group}
              onJoin={() => joinGroup(group.id)}
              isJoining={joiningId === group.id}
              index={i}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateGroupModal
            onClose={() => setShowCreate(false)}
            onCreated={(id) => { loadGroups(); router.push(`/student/study-groups/${id}`); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState({ name: "", description: "", isPublic: true, maxMembers: "30", tags: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/v1/study-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description || null,
        isPublic: form.isPublic,
        maxMembers: parseInt(form.maxMembers),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onCreated(data.group.id);
    }
    setLoading(false);
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
            <Users className="w-5 h-5 text-sky-400" /> Create Study Group
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Group name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="React Learners" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will you study together?" rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Max members</label>
              <input type="number" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} min="2" max="100"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Visibility</label>
              <button type="button" onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                className={cn("w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-colors",
                  form.isPublic ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-white/5 text-slate-400 border-white/10")}>
                {form.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {form.isPublic ? "Public" : "Private"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="React, JavaScript, Frontend"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/50" />
          </div>
          <button type="submit" disabled={loading || !form.name.trim()}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Users className="w-4 h-4" /> Create Group</>}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
