"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/stores/social-store";

interface Props {
  targetUserId: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
}

export function FollowButton({ targetUserId, initialFollowing = false, size = "md" }: Props) {
  const { followMap, setFollow } = useSocialStore();
  const isFollowing = followMap[targetUserId] ?? initialFollowing;
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollow(targetUserId, data.following);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      onClick={toggle}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-1.5 font-semibold rounded-xl transition-all border",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        isFollowing
          ? "bg-white/5 border-white/10 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          : "bg-sky-500 border-sky-500 text-white hover:bg-sky-400"
      )}
    >
      {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
}
