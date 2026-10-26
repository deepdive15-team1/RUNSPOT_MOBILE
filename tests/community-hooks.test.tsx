import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { CommunityApi } from "@/src/api/community/communityApi.index";
import { communityKeys } from "@/src/constants/queryKeys";
import { useToggleLike } from "@/src/hooks/community/useToggleLike";
import type {
  PostDetailResponse,
  PostListResponse,
} from "@/src/types/api/community";

jest.mock("@/src/api/community/communityApi.index", () => ({
  CommunityApi: {
    likePost: jest.fn(),
    cancelLikePost: jest.fn(),
  },
}));

const postDetail: PostDetailResponse = {
  postId: 1,
  boardType: "GENERAL",
  title: "제목",
  content: "내용",
  author: { userId: 2, name: "러너" },
  imageKeys: [],
  tags: [],
  runningRecordId: null,
  likeCount: 3,
  commentCount: 0,
  viewCount: 0,
  status: "PUBLISHED",
  liked: false,
  scrapped: false,
  courseScrapped: false,
  mine: false,
  createdAt: "2026-10-26T00:00:00Z",
  updatedAt: "2026-10-26T00:00:00Z",
};

const postList: PostListResponse = {
  items: [
    {
      postId: 1,
      boardType: "GENERAL",
      title: "제목",
      content: "내용",
      authorName: "러너",
      thumbnailKey: null,
      likeCount: 3,
      commentCount: 0,
      viewCount: 0,
      createdAt: "2026-10-26T00:00:00Z",
      liked: false,
    },
  ],
  nextCursor: null,
  hasNext: false,
};

describe("커뮤니티 좋아요 낙관적 업데이트", () => {
  it("실패하면 사용자별 상세와 목록 캐시를 이전 값으로 복원한다", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    const detailKey = communityKeys.postDetailForUser(1, 7);
    const listKey = communityKeys.postList("GENERAL", "LATEST", "");
    queryClient.setQueryData(detailKey, postDetail);
    queryClient.setQueryData(listKey, {
      pages: [postList],
      pageParams: [null],
    });
    (CommunityApi.likePost as jest.Mock).mockRejectedValueOnce(
      new Error("network error"),
    );

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(() => useToggleLike(1), { wrapper });

    let mutationError: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync(false);
      } catch (error) {
        mutationError = error;
      }
    });

    expect(mutationError).toEqual(new Error("network error"));
    expect(queryClient.getQueryData(detailKey)).toEqual(postDetail);
    expect(queryClient.getQueryData(listKey)).toEqual({
      pages: [postList],
      pageParams: [null],
    });

    unmount();
    queryClient.clear();
  });
});
