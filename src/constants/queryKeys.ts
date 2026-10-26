import type { BoardType, PostSort } from "../types/api/community";
import { GetMarkersParams } from "../types/api/search";

export const sessionKeys = {
  all: ["session"] as const,
  detail: (id: number | string) => [...sessionKeys.all, "detail", id] as const,
  summary: (id: number | string) =>
    [...sessionKeys.all, "summary", id] as const,
};

export const attendanceKey = {
  all: (sessionId: number) => ["attendance", sessionId] as const,
};

export const mapKeys = {
  all: ["mapMarkers"] as const,
  markers: (bounds: GetMarkersParams | null) =>
    bounds
      ? ([
          ...mapKeys.all,
          bounds.leftX,
          bounds.leftY,
          bounds.rightX,
          bounds.rightY,
        ] as const)
      : ([...mapKeys.all, "no-bounds"] as const),
};

export const myPageKeys = {
  all: ["myPage"] as const,
  profile: () => [...myPageKeys.all, "profile"] as const,
  createdRuns: () => [...myPageKeys.all, "createdRuns"] as const,
  appliedRuns: () => [...myPageKeys.all, "appliedRuns"] as const,
  historyRuns: () => [...myPageKeys.all, "historyRuns"] as const,
};

export const searchKeys = {
  all: ["sessions", "search"] as const,
  query: (debouncedQuery: string) =>
    [...searchKeys.all, debouncedQuery] as const,
};

export const nearbyKeys = {
  all: ["nearbySessions"] as const,
  location: (x: number, y: number) => [...nearbyKeys.all, x, y] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (unreadOnly = false) =>
    [...notificationKeys.lists(), { unreadOnly }] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export const communityKeys = {
  all: ["community"] as const,
  posts: () => [...communityKeys.all, "posts"] as const,
  postList: (boardType: BoardType, sort: PostSort, query: string) =>
    [...communityKeys.posts(), boardType, sort, query] as const,
  postDetails: () => [...communityKeys.all, "postDetail"] as const,
  postDetail: (postId: number) =>
    [...communityKeys.postDetails(), postId] as const,
  postDetailForUser: (postId: number, userId?: number) =>
    [...communityKeys.postDetail(postId), userId ?? "guest"] as const,
  comments: (postId: number) =>
    [...communityKeys.all, "comments", postId] as const,
  scraps: () => [...communityKeys.all, "scraps"] as const,
  drafts: () => [...communityKeys.all, "drafts"] as const,
  viewUrls: (keys: string[]) =>
    [...communityKeys.all, "viewUrls", ...keys] as const,
};

export const runningRecordKeys = {
  all: ["runningRecords"] as const,
  mine: () => [...runningRecordKeys.all, "mine"] as const,
};
