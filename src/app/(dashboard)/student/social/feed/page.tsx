"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Rss, Globe, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { ActivityFeedItem } from "@/components/social/ActivityFeedItem";
import { useSocialStore } from "@/stores/social-store";
import { cn } from "@/lib/utils";
import type { ActivityFeedItem as FeedItem } from "@/lib/realtime/social";

type FeedType = "following" | "global";

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [feedType, setFeedType] = useState<FeedType>("following");
  const [loading, setLoading] = useState(true);
  const { feedItems, feedCursor, feedHasMore, setFeedItems, appendFeedItems, setFeedCursor, setFeedHasMore } = useSocialStore();
  const loaderRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  const loadFeed = useCallback(async (reset = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (reset) setLoading(true);

    const params = new URLSearchParams({ type: feedType });
    const cursor = reset ? null : feedCursor;
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/v1/activity-feed?${params}`);
    const data = await res.json();

    const items: FeedItem[] = data.items ?? [];
    if (reset) {
      setFeedItems(items);
    } else {
      appendFeedItems(items);
    }
    setFeedCursor(data.nextCursor);
    setFeedHasMore(!!data.nextCursor);

    setLoading(false);
    fetchingRef.current = false;
  }, [feedType, feedCursor, setFeedItems, appendFeedItems, setFeedCursor, setFeedHasMore]);

  useEffect(() => {
    loadFeed(true);
  }, [feedType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && feedHasMore && !fetchingRef.current) loadFeed(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [feedHasMore, loadFeed]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Rss className="w-5 h-5 text-sky-400" />
          Activity Feed
        </h1>
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          <button
            onClick={() => setFeedType("following")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              feedType === "following" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white")}
          >
            <Users className="w-3.5 h-3.5" /> Following
          </button>
          <button
            onClick={() => setFeedType("global")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              feedType === "global" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white")}
          >
            <Globe className="w-3.5 h-3.5" /> Global
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : feedItems.length === 0 ? (
          <div className="text-center py-16">
            <Rss className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm">
              {feedType === "following" ? "Follow people to see their activity here" : "No activity yet"}
            </p>
          </div>
        ) : (
          feedItems.map((item) => (
            <ActivityFeedItem key={item.id} item={item} currentUserId={session?.user?.id ?? ""} />
          ))
        )}

        {feedHasMore && !loading && (
          <div ref={loaderRef} className="flex justify-center py-4">
            <motion.div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
