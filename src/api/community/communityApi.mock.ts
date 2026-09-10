/* eslint-disable @typescript-eslint/no-unused-vars */
export type BoardType = "GENERAL" | "COURSE";
export type PostSort = "LATEST" | "POPULAR";
export type PostStatus = "PUBLISHED" | "DRAFT" | "DELETED";
export type CommentStatus = "ACTIVE" | "DELETED";

export interface AuthorResponse {
  userId: number;
  name: string;
  mannerTemperature?: number;
}

export interface PostSummaryResponse {
  postId: number;
  boardType: BoardType;
  title: string;
  content: string;
  author: AuthorResponse;
  imageKeys: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}

export interface PostListResponse {
  items: PostSummaryResponse[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface PostDetailResponse extends Omit<
  PostSummaryResponse,
  "postId"
> {
  postId: number;
  runningRecordId: number | null;
  status: PostStatus;
  liked: boolean;
  scrapped: boolean;
  courseScrapped: boolean;
  mine: boolean;
  updatedAt: string;

  _mockRouteData?: {
    distance: number;
    routePolyline: { latitude: number; longitude: number }[];
    markers: {
      id: number;
      latitude: number;
      longitude: number;
      title: string;
      description: string;
    }[];
  };
}

export interface CommentResponse {
  commentId: number;
  parentId: number | null;
  authorId: number;
  authorName: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  mine?: boolean;
}

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
      postId: cursor ? parseInt(cursor) + i : i + 1,
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
