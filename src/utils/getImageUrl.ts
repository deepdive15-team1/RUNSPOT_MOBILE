// TODO: [API] 백엔드에서 S3/CloudFront 기본 도메인을 받으면 EXPO_PUBLIC_S3_BASE_URL에 설정하고, 실제 응답 형식에 맞게 이미지 URL 조합 로직을 확인 및 수정
const S3_BASE_URL =
  process.env.EXPO_PUBLIC_S3_BASE_URL || "https://your-s3-bucket-url.com/";

export const getImageUrl = (uriOrKey: string) => {
  if (
    uriOrKey.startsWith("http") ||
    uriOrKey.startsWith("file://") ||
    uriOrKey.startsWith("content://")
  ) {
    return uriOrKey;
  }
  return `${S3_BASE_URL}${uriOrKey}`;
};
