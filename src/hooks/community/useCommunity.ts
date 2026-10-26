import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { CommunityApi } from "@/src/api/community/communityApi.index";
import { ReportApi } from "@/src/api/report/reportApi.index";
import { communityKeys } from "@/src/constants/queryKeys";
import type {
  BoardType,
  CreateCommentRequest,
  PostSort,
} from "@/src/types/api/community";
import type { CreateReportRequest } from "@/src/types/api/report";

interface UsePostsParams {
  boardType: BoardType;
  sort: PostSort;
  query: string;
}

export function usePosts({ boardType, sort, query }: UsePostsParams) {
  return useInfiniteQuery({
    queryKey: communityKeys.postList(boardType, sort, query),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      CommunityApi.getPosts({
        boardType,
        sort,
        q: query,
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function usePostDetail(
  postId: number | undefined,
  userId?: number,
  enabled = true,
  staleTime = 0,
) {
  const validPostId =
    typeof postId === "number" && Number.isSafeInteger(postId) && postId > 0;

  return useQuery({
    queryKey: communityKeys.postDetailForUser(postId ?? 0, userId),
    queryFn: () => CommunityApi.getPostDetail(postId!),
    enabled: enabled && validPostId,
    staleTime,
  });
}

export function useComments(postId: number) {
  return useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => CommunityApi.getComments(postId),
    enabled: Number.isSafeInteger(postId) && postId > 0,
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => CommunityApi.deletePost(postId),
    onSuccess: async (_data, postId) => {
      queryClient.removeQueries({
        queryKey: communityKeys.postDetail(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: communityKeys.posts(),
      });
    },
  });
}

interface ToggleScrapVariables {
  postId: number;
  scrapped: boolean;
}

export function useToggleScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, scrapped }: ToggleScrapVariables) =>
      scrapped
        ? CommunityApi.cancelScrapPost(postId)
        : CommunityApi.scrapPost(postId),
    onSuccess: async (_data, { postId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityKeys.postDetail(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: communityKeys.scraps(),
        }),
      ]);
    },
  });
}

interface CreateCommentVariables {
  postId: number;
  data: CreateCommentRequest;
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: CreateCommentVariables) =>
      CommunityApi.createComment(postId, data),
    onSuccess: async (_data, { postId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityKeys.comments(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: communityKeys.postDetail(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: communityKeys.posts(),
        }),
      ]);
    },
  });
}

interface DeleteCommentVariables {
  postId: number;
  commentId: number;
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentVariables) =>
      CommunityApi.deleteComment(commentId),
    onSuccess: async (_data, { postId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityKeys.comments(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: communityKeys.postDetail(postId),
        }),
        queryClient.invalidateQueries({
          queryKey: communityKeys.posts(),
        }),
      ]);
    },
  });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: (request: CreateReportRequest) =>
      ReportApi.createReport(request),
  });
}
