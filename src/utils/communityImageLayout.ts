export const COMMUNITY_FEED_ASPECT_RATIO = 4 / 3;
export const COMMUNITY_DETAIL_MAX_HEIGHT_RATIO = 0.75;

interface CommunityDetailImageHeightParams {
  containerWidth: number;
  viewportHeight: number;
  imageWidth?: number;
  imageHeight?: number;
}

export function getCommunityDetailImageHeight({
  containerWidth,
  viewportHeight,
  imageWidth,
  imageHeight,
}: CommunityDetailImageHeightParams): number {
  const maxHeight = viewportHeight * COMMUNITY_DETAIL_MAX_HEIGHT_RATIO;

  if (!imageWidth || !imageHeight || imageWidth <= 0 || imageHeight <= 0) {
    return Math.min(containerWidth, maxHeight);
  }

  const naturalHeight = containerWidth * (imageHeight / imageWidth);
  return Math.min(naturalHeight, maxHeight);
}
