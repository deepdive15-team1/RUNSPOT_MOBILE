/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BoardType,
  CommentResponse,
  PostDetailResponse,
  PostListResponse,
  PostSort,
  PostSummaryResponse,
  PostUpsertRequest,
} from "@/src/types/api/community";

export const getPosts = async ({
  boardType,
  sort,
  q,
  cursor,
  size = 20,
}: {
  boardType: BoardType;
  sort: PostSort;
  q?: string;
  cursor: string | null;
  size?: number;
}): Promise<PostListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mockItems: PostSummaryResponse[] = Array.from({ length: 5 }).map(
    (_, i) => ({
      postId: cursor ? parseInt(cursor) + i + 1 : i + 1,
      boardType,
      title: boardType === "GENERAL" ? "러닝화 추천" : "여의도 코스",
      content: "테스트 내용입니다.",
      author: {
        userId: 1,
        name: "러너김",
      },
      imageKeys:
        boardType === "GENERAL" ? ["https://picsum.photos/400/300"] : [],
      tags: ["#러닝"],
      likeCount: 24,
      commentCount: 5,
      viewCount: 100,
      createdAt: new Date().toISOString(),
    }),
  );

  return {
    items: mockItems,
    nextCursor:
      cursor === "30" ? null : String((cursor ? parseInt(cursor) : 0) + 5),
    hasNext: cursor !== "30",
  };
};

export const getPostDetail = async (
  postId: number,
): Promise<PostDetailResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const isCourse = postId % 2 !== 0; // 임시 분기

  return {
    postId,
    boardType: isCourse ? "COURSE" : "GENERAL",
    title: "상세 게시글 테스트",
    content: "상세 내용입니다.",
    author: {
      userId: 1,
      name: "러너김",
    },
    imageKeys: isCourse ? [] : ["https://picsum.photos/400/300"],
    tags: ["#테스트"],
    runningRecordId: isCourse ? 999 : null,
    likeCount: 10,
    commentCount: 2,
    viewCount: 50,
    status: "PUBLISHED",
    liked: false,
    scrapped: false,
    courseScrapped: false,
    mine: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _mockRouteData: isCourse
      ? {
          distance: 5,
          routePolyline: [
            { latitude: 37.5283, longitude: 126.9339 },
            { latitude: 37.5312, longitude: 126.9421 },
          ],
          markers: [
            {
              id: 1,
              latitude: 37.5283,
              longitude: 126.9339,
              title: "출발",
              description: "설명",
            },
          ],
        }
      : undefined,
  };
};

export const getComments = async (
  _postId: number,
): Promise<CommentResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    {
      commentId: 1,
      parentId: null,
      authorId: 2,
      authorName: "운동왕",
      content: "사이즈 추천해주세요!",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      mine: false,
    },
    {
      commentId: 2,
      parentId: 1,
      authorId: 1,
      authorName: "러너김",
      content: "반업 추천합니다.",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      mine: true,
    },
    {
      commentId: 3,
      parentId: null,
      authorId: 3,
      authorName: "삭제된유저",
      content: "삭제된 댓글입니다.",
      status: "DELETED",
      createdAt: new Date().toISOString(),
      mine: false,
    },
  ];
};

export const createPost = async (payload: PostUpsertRequest) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { postId: Math.floor(Math.random() * 1000) };
};

export const saveDraftPost = async (payload: PostUpsertRequest) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { postId: Math.floor(Math.random() * 1000) };
};

export const uploadImage = async (localUri: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `s3-uploaded-key-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const editPost = async ({
  postId,
  payload,
}: {
  postId: number;
  payload: PostUpsertRequest;
}) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { postId };
};
