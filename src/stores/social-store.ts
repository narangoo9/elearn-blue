import { create } from "zustand";
import type { ActivityFeedItem, StudyGroupMessage } from "@/lib/realtime/social";

interface SocialState {
  // Follow map: userId -> isFollowing
  followMap: Record<string, boolean>;
  setFollow: (userId: string, following: boolean) => void;

  // Activity feed
  feedItems: ActivityFeedItem[];
  feedCursor: string | null;
  feedHasMore: boolean;
  setFeedItems: (items: ActivityFeedItem[]) => void;
  appendFeedItems: (items: ActivityFeedItem[]) => void;
  prependFeedItem: (item: ActivityFeedItem) => void;
  setFeedCursor: (cursor: string | null) => void;
  setFeedHasMore: (hasMore: boolean) => void;
  toggleFeedLike: (activityId: string, userId: string) => void;

  // Group messages: groupId -> messages[]
  groupMessages: Record<string, StudyGroupMessage[]>;
  appendGroupMessage: (groupId: string, msg: StudyGroupMessage) => void;
  prependGroupMessages: (groupId: string, msgs: StudyGroupMessage[]) => void;
  markGroupRead: (groupId: string) => void;

  // Unread counts: groupId -> count
  unreadGroupMessages: Record<string, number>;
  incrementGroupUnread: (groupId: string) => void;

  // Online users
  onlineUsers: Set<string>;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;

  // Typing indicators: groupId -> Set<userId>
  typingUsers: Record<string, Set<string>>;
  setTyping: (groupId: string, userId: string, isTyping: boolean) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  followMap: {},
  setFollow: (userId, following) =>
    set((s) => ({ followMap: { ...s.followMap, [userId]: following } })),

  feedItems: [],
  feedCursor: null,
  feedHasMore: true,
  setFeedItems: (items) => set({ feedItems: items }),
  appendFeedItems: (items) =>
    set((s) => ({ feedItems: [...s.feedItems, ...items] })),
  prependFeedItem: (item) =>
    set((s) => ({ feedItems: [item, ...s.feedItems] })),
  setFeedCursor: (cursor) => set({ feedCursor: cursor }),
  setFeedHasMore: (hasMore) => set({ feedHasMore: hasMore }),
  toggleFeedLike: (activityId, userId) =>
    set((s) => ({
      feedItems: s.feedItems.map((item) => {
        if (item.id !== activityId) return item;
        const alreadyLiked = item.likes.some((l) => l.userId === userId);
        return {
          ...item,
          likes: alreadyLiked
            ? item.likes.filter((l) => l.userId !== userId)
            : [...item.likes, { userId }],
          _count: {
            ...item._count,
            likes: item._count.likes + (alreadyLiked ? -1 : 1),
          },
        };
      }),
    })),

  groupMessages: {},
  appendGroupMessage: (groupId, msg) =>
    set((s) => ({
      groupMessages: {
        ...s.groupMessages,
        [groupId]: [...(s.groupMessages[groupId] ?? []), msg],
      },
    })),
  prependGroupMessages: (groupId, msgs) =>
    set((s) => {
      const existing = s.groupMessages[groupId] ?? [];
      const existingIds = new Set(existing.map((m) => m.id));
      const newMsgs = msgs.filter((m) => !existingIds.has(m.id));
      return {
        groupMessages: {
          ...s.groupMessages,
          [groupId]: [...newMsgs, ...existing],
        },
      };
    }),
  markGroupRead: (groupId) =>
    set((s) => ({
      unreadGroupMessages: { ...s.unreadGroupMessages, [groupId]: 0 },
    })),

  unreadGroupMessages: {},
  incrementGroupUnread: (groupId) =>
    set((s) => ({
      unreadGroupMessages: {
        ...s.unreadGroupMessages,
        [groupId]: (s.unreadGroupMessages[groupId] ?? 0) + 1,
      },
    })),

  onlineUsers: new Set(),
  setUserOnline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    }),
  setUserOffline: (userId) =>
    set((s) => {
      const next = new Set(s.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  typingUsers: {},
  setTyping: (groupId, userId, isTyping) =>
    set((s) => {
      const current = new Set(s.typingUsers[groupId] ?? []);
      if (isTyping) current.add(userId);
      else current.delete(userId);
      return { typingUsers: { ...s.typingUsers, [groupId]: current } };
    }),
}));
