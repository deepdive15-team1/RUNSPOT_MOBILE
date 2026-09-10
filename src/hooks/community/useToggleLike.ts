import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import {
  PostDetailResponse,
  PostListResponse,
} from "@/src/types/api/community";

// TODO[API]: 게시글 좋아요 토글 API 연동
const postLikeAPI = async (_postId: number) => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};

export const useToggleLike = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postLikeAPI(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({
        queryKey: ["postDetail", postId.toString()],
      });

      const previousPosts = queryClient.getQueryData<
        InfiniteData<PostListResponse>
      >(["posts"]);
      const previousDetail = queryClient.getQueryData<PostDetailResponse>([
        "postDetail",
        postId.toString(),
      ]);

      queryClient.setQueryData<InfiniteData<PostListResponse>>(
        ["posts"],
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
                      likeCount: previousDetail?.liked
                        ? post.likeCount - 1
                        : post.likeCount + 1,
                    }
                  : post,
              ),
            })),
          };
        },
      );

      queryClient.setQueryData<PostDetailResponse>(
        ["postDetail", postId.toString()],
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

      return { previousPosts, previousDetail };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ["postDetail", postId.toString()],
          context.previousDetail,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["postDetail", postId.toString()],
      });
    },
  });
};
