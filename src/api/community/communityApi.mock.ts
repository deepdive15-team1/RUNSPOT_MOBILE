/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CommentResponse,
  CreateCommentRequest,
  GetPostsParams,
  PostDetailResponse,
  PostListResponse,
  PostSort,
  PostSummaryResponse,
  PostUpsertRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "@/src/types/api/community";

// 임시저장
export const getDraftPosts = async (): Promise<PostDetailResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [];
};

export const saveDraftPost = async (
  payload: PostUpsertRequest,
): Promise<PostDetailResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    postId: Math.floor(Math.random() * 1000),
    boardType: payload.boardType,
    title: payload.title,
    content: payload.content,
    runningRecordId: payload.runningRecordId || null,
    imageKeys: payload.imageKeys || [],
    tags: payload.tags || [],
    status: "DRAFT",
    author: { userId: 1, name: "러너김" },
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    liked: false,
    scrapped: false,
    courseScrapped: false,
    mine: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// 게시글 기본 CRUD
export const getPosts = async ({
  boardType,
  sort,
  q,
  cursor,
  size = 20,
}: GetPostsParams): Promise<PostListResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const mockItems: PostSummaryResponse[] = Array.from({ length: 5 }).map(
    (_, i) => ({
      postId: cursor ? parseInt(cursor) + i + 1 : i + 1,
      boardType: boardType || "GENERAL",
      title: boardType === "GENERAL" ? "러닝화 추천" : "여의도 코스",
      content: "테스트 내용입니다.",
      authorName: "러너김",
      thumbnailKey:
        boardType === "GENERAL" ? "https://picsum.photos/400/300" : null,
      likeCount: 24,
      commentCount: 5,
      viewCount: 100,
      createdAt: new Date().toISOString(),
      liked: false,
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
  const isCourse = postId % 2 !== 0;

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

export const createPost = async (
  payload: PostUpsertRequest,
): Promise<PostDetailResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    postId: Math.floor(Math.random() * 1000),
    boardType: payload.boardType,
    title: payload.title,
    content: payload.content,
    runningRecordId: payload.runningRecordId || null,
    imageKeys: payload.imageKeys || [],
    tags: payload.tags || [],
    status: payload.status,
    author: { userId: 1, name: "러너김" },
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    liked: false,
    scrapped: false,
    courseScrapped: false,
    mine: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const editPost = async (
  postId: number,
  payload: PostUpsertRequest,
): Promise<PostDetailResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    postId,
    boardType: payload.boardType,
    title: payload.title,
    content: payload.content,
    runningRecordId: payload.runningRecordId || null,
    imageKeys: payload.imageKeys || [],
    tags: payload.tags || [],
    status: payload.status,
    author: { userId: 1, name: "러너김" },
    likeCount: 15,
    commentCount: 3,
    viewCount: 42,
    liked: false,
    scrapped: false,
    courseScrapped: false,
    mine: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const deletePost = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};

// 게시글 상호작용 (좋아요, 스크랩)
export const likePost = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
};

export const cancelLikePost = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
};

export const scrapPost = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
};

export const cancelScrapPost = async (postId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
};

export const getMyScraps = async (): Promise<PostSummaryResponse[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [];
};

// 댓글
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

export const createComment = async (
  postId: number,
  data: CreateCommentRequest,
): Promise<CommentResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    commentId: Math.floor(Math.random() * 10000),
    parentId: data.parentId || null,
    authorId: 1,
    authorName: "러너김",
    content: data.content,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    mine: true,
  };
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
};

// 파일 업로드
export const getPresignedUrls = async (
  payload: PresignedUrlRequest,
): Promise<PresignedUrlResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    items: payload.files.map((file, index) => ({
      imageKey: `mock-image-key-${Date.now()}-${index}.jpg`,
      uploadUrl: `https://mock-s3.com/upload/${index}`,
      expiresIn: 300,
    })),
  };
};

export const uploadFileToS3 = async (
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
};
