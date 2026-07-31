/**
 * 평가 공통 타입 (긍정/부정)
 */
export type RatingType = "POSITIVE" | "NEGATIVE";

/**
 * 호스트 평가 Request Body
 */
export interface HostRatingRequest {
  rating: RatingType;
  tags?: string[];
}

/**
 * 개별 멤버 평가 아이템
 */
export interface MemberRatingItem {
  targetUserId: number;
  rating: RatingType;
}

/**
 * 멤버 전체 평가 Request Body
 */
export interface MemberRatingRequest {
  ratings: MemberRatingItem[];
}
