import * as realAPI from "./communityApi";
import * as mockAPI from "./communityApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const CommunityApi = {
  // 임시저장
  getDraftPosts: isMock ? mockAPI.getDraftPosts : realAPI.getDraftPosts,
  saveDraftPost: isMock ? mockAPI.saveDraftPost : realAPI.saveDraftPost,

  // 게시글 기본 CRUD
  getPosts: isMock ? mockAPI.getPosts : realAPI.getPosts,
  getPostDetail: isMock ? mockAPI.getPostDetail : realAPI.getPostDetail,
  createPost: isMock ? mockAPI.createPost : realAPI.createPost,
  editPost: isMock ? mockAPI.editPost : realAPI.editPost,
  deletePost: isMock ? mockAPI.deletePost : realAPI.deletePost,

  // 게시글 상호작용 (좋아요, 스크랩)
  likePost: isMock ? mockAPI.likePost : realAPI.likePost,
  cancelLikePost: isMock ? mockAPI.cancelLikePost : realAPI.cancelLikePost,
  scrapPost: isMock ? mockAPI.scrapPost : realAPI.scrapPost,
  cancelScrapPost: isMock ? mockAPI.cancelScrapPost : realAPI.cancelScrapPost,
  getMyScraps: isMock ? mockAPI.getMyScraps : realAPI.getMyScraps,

  // 댓글
  getComments: isMock ? mockAPI.getComments : realAPI.getComments,
  createComment: isMock ? mockAPI.createComment : realAPI.createComment,
  deleteComment: isMock ? mockAPI.deleteComment : realAPI.deleteComment,

  // 파일 업로드
  getPresignedUrls: isMock
    ? mockAPI.getPresignedUrls
    : realAPI.getPresignedUrls,
  uploadFileToS3: isMock ? mockAPI.uploadFileToS3 : realAPI.uploadFileToS3,
};
