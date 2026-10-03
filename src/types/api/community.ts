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
  authorName: string;
  thumbnailKey: string | null;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  liked: boolean;
}

export interface PostListResponse {
  items: PostSummaryResponse[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface PostDetailResponse {
  postId: number;
  boardType: BoardType;
  title: string;
  content: string;
  author: AuthorResponse;
  imageKeys: string[];
  tags: string[];
  runningRecordId: number | null;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  status: PostStatus;
  liked: boolean;
  scrapped: boolean;
  courseScrapped: boolean;
  mine: boolean;
  createdAt: string;
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
  runningRecordId?: number | null | undefined;
  imageKeys?: string[];
  tags?: string[];
  status: PostStatus;
}

export interface GetPostsParams {
  boardType?: "GENERAL" | "COURSE";
  sort?: "LATEST" | "POPULAR";
  q?: string;
  cursor?: string;
  size?: number;
}

export interface CreateCommentRequest {
  parentId?: number;
  content: string;
}

export interface PresignedFileInfo {
  fileName: string;
  contentType: string;
  size: number;
}

export interface PresignedUrlRequest {
  domain: "POST";
  files: PresignedFileInfo[];
}

export interface PresignedUrlResponse {
  items: {
    imageKey: string;
    uploadUrl: string;
    expiresIn: number;
  }[];
}
