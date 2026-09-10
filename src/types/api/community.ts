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

export interface PostUpsertRequest {
  boardType: BoardType;
  title: string;
  content: string;
  runningRecordId?: number | null;
  imageKeys?: string[];
  tags?: string[];
  status: PostStatus;
}
