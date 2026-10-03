import { axiosInstance } from "../axiosInstance";

import {
  CommentResponse,
  CreateCommentRequest,
  GetPostsParams,
  PostDetailResponse,
  PostListResponse,
  PostSummaryResponse,
  PostUpsertRequest,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "@/src/types/api/community";

// 임시저장
export const getDraftPosts = async (): Promise<PostDetailResponse[]> => {
  const response = await axiosInstance.get<PostDetailResponse[]>(
    "/api/v1/posts/drafts",
  );
  return response.data;
};

export const saveDraftPost = async (
  requestBody: PostUpsertRequest,
): Promise<PostDetailResponse> => {
  const response = await axiosInstance.post<PostDetailResponse>(
    "/api/v1/posts/drafts",
    requestBody,
  );
  return response.data;
};

// 게시글 기본 CRUD
export const getPosts = async (
  params: GetPostsParams,
): Promise<PostListResponse> => {
  const response = await axiosInstance.get<PostListResponse>("/api/v1/posts", {
    params,
  });
  return response.data;
};

export const getPostDetail = async (
  postId: number,
): Promise<PostDetailResponse> => {
  const response = await axiosInstance.get<PostDetailResponse>(
    `/api/v1/posts/${postId}`,
  );
  return response.data;
};

export const createPost = async (
  payload: PostUpsertRequest,
): Promise<PostDetailResponse> => {
  const response = await axiosInstance.post<PostDetailResponse>(
    "/api/v1/posts",
    payload,
  );
  return response.data;
};

export const editPost = async (
  postId: number,
  payload: PostUpsertRequest,
): Promise<PostDetailResponse> => {
  const response = await axiosInstance.patch<PostDetailResponse>(
    `/api/v1/posts/${postId}`,
    payload,
  );
  return response.data;
};

export const deletePost = async (postId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/posts/${postId}`);
};

// 게시글 상호작용 (좋아요, 스크랩)
export const likePost = async (postId: number): Promise<void> => {
  await axiosInstance.post(`/api/v1/posts/${postId}/like`);
};

export const cancelLikePost = async (postId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/posts/${postId}/like`);
};

export const scrapPost = async (postId: number): Promise<void> => {
  await axiosInstance.post(`/api/v1/posts/${postId}/scrap`);
};

export const cancelScrapPost = async (postId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/posts/${postId}/scrap`);
};

export const getMyScraps = async (): Promise<PostSummaryResponse[]> => {
  const response =
    await axiosInstance.get<PostSummaryResponse[]>("/api/v1/me/scraps");
  return response.data;
};

// 댓글
export const getComments = async (
  postId: number,
): Promise<CommentResponse[]> => {
  const response = await axiosInstance.get<CommentResponse[]>(
    `/api/v1/posts/${postId}/comments`,
  );
  return response.data;
};

export const createComment = async (
  postId: number,
  data: CreateCommentRequest,
): Promise<CommentResponse> => {
  const response = await axiosInstance.post<CommentResponse>(
    `/api/v1/posts/${postId}/comments`,
    data,
  );
  return response.data;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/comments/${commentId}`);
};

// 파일 업로드
export const getPresignedUrls = async (
  payload: PresignedUrlRequest,
): Promise<PresignedUrlResponse> => {
  const response = await axiosInstance.post<PresignedUrlResponse>(
    "/api/v1/files/presigned-urls",
    payload,
  );
  return response.data;
};

export const uploadFileToS3 = async (
  presignedUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`S3 업로드 실패: ${response.status}`);
  }
};
