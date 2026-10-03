import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { CommunityApi } from "@/src/api/community/communityApi.index";
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
      await queryClient.cancelQueries({ queryKey: ["communityPosts"] });
      await queryClient.cancelQueries({ queryKey: ["postDetail", postId] });

      const previousDetail = queryClient.getQueryData<PostDetailResponse>([
        "postDetail",
        postId,
      ]);

      if (previousDetail) {
        queryClient.setQueryData<PostDetailResponse>(
          ["postDetail", postId],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              liked: !oldData.liked,
              likeCount: oldData.liked
                ? oldData.likeCount - 1
                : oldData.likeCount + 1,
            };
          },
        );
      }

      const queryCache = queryClient.getQueryCache();
      const communityQueries = queryCache.findAll({
        queryKey: ["communityPosts"],
      });

      communityQueries.forEach((query) => {
        queryClient.setQueryData<InfiniteData<PostListResponse>>(
          query.queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            return {
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
            };
          },
        );
      });

      return { previousDetail };
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      queryClient.invalidateQueries({ queryKey: ["postDetail", postId] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      queryClient.invalidateQueries({ queryKey: ["postDetail", postId] });
    },
  });
};
