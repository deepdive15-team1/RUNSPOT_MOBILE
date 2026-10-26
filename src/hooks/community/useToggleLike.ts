import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { CommunityApi } from "@/src/api/community/communityApi.index";
import { communityKeys } from "@/src/constants/queryKeys";
import {
  PostDetailResponse,
  PostListResponse,
} from "@/src/types/api/community";

export const useToggleLike = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isCurrentlyLiked: boolean) => {
      if (isCurrentlyLiked) {
        await CommunityApi.cancelLikePost(postId);
      } else {
        await CommunityApi.likePost(postId);
      }
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: communityKeys.posts() }),
        queryClient.cancelQueries({
          queryKey: communityKeys.postDetail(postId),
        }),
      ]);

      const previousDetails = queryClient.getQueriesData<PostDetailResponse>({
        queryKey: communityKeys.postDetail(postId),
      });
      const previousPostLists = queryClient.getQueriesData<
        InfiniteData<PostListResponse>
      >({ queryKey: communityKeys.posts() });

      queryClient.setQueriesData<PostDetailResponse>(
        { queryKey: communityKeys.postDetail(postId) },
        (oldData) =>
          oldData
            ? {
                ...oldData,
                liked: !oldData.liked,
                likeCount: oldData.liked
                  ? oldData.likeCount - 1
                  : oldData.likeCount + 1,
              }
            : oldData,
      );

      queryClient.setQueriesData<InfiniteData<PostListResponse>>(
        { queryKey: communityKeys.posts() },
        (oldData) =>
          oldData
            ? {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  items: page.items.map((post) =>
                    post.postId === postId
                      ? {
                          ...post,
                          liked: !post.liked,
                          likeCount: post.liked
                            ? post.likeCount - 1
                            : post.likeCount + 1,
                        }
                      : post,
                  ),
                })),
              }
            : oldData,
      );

      return { previousDetails, previousPostLists };
    },
    onError: (_error, _variables, context) => {
      context?.previousDetails.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousPostLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: communityKeys.posts() }),
        queryClient.invalidateQueries({
          queryKey: communityKeys.postDetail(postId),
        }),
      ]),
  });
};
