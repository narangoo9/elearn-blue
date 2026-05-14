// Supabase realtime channel helpers for social features

export type SocialRealtimeEvent =
  | { type: "new_message"; payload: StudyGroupMessage }
  | { type: "new_activity"; payload: ActivityFeedItem }
  | { type: "user_online"; payload: { userId: string } }
  | { type: "user_offline"; payload: { userId: string } }
  | { type: "typing_start"; payload: { userId: string; groupId: string } }
  | { type: "typing_stop"; payload: { userId: string; groupId: string } }
  | { type: "challenge_update"; payload: { challengeId: string } };

export interface ActivityFeedItem {
  id: string;
  userId: string;
  type: string;
  data: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    username: string | null;
    level: number;
  };
  _count: { likes: number; comments: number };
  likes: { userId: string }[];
}

export interface ActivityComment {
  id: string;
  userId: string;
  activityId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    username: string | null;
  };
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    username: string | null;
  };
}

export function activityFeedChannel(userId: string) {
  return `activity-feed:${userId}`;
}

export function studyGroupChannel(groupId: string) {
  return `study-group:${groupId}`;
}

export function userPresenceChannel(userId: string) {
  return `presence:${userId}`;
}

export function globalFeedChannel() {
  return "activity-feed:global";
}

export function challengeChannel(challengeId: string) {
  return `challenge:${challengeId}`;
}
