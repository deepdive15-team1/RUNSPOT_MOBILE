import { useQueries } from "@tanstack/react-query";

import { CommunityApi } from "@/src/api/community/communityApi.index";

const VIEW_URL_STALE_TIME = 55 * 60 * 1000;

export const isDirectImageUri = (value: string): boolean =>
  /^(https?:\/\/|file:\/\/|content:\/\/|data:)/i.test(value);

export function mapCommunityImageFallbackUrls(
  keys: string[],
  imageUrls?: string[],
): Record<string, string> {
  const urls: Record<string, string> = {};
  keys.forEach((key, index) => {
    const url = imageUrls?.[index];
    if (key && url && isDirectImageUri(url)) urls[key] = url;
  });
  return urls;
}

export function useCommunityImageUrls(keys: string[]) {
  const imageKeys = Array.from(
    new Set(keys.filter((key) => key && !isDirectImageUri(key))),
  );
  const batches: string[][] = [];
  for (let index = 0; index < imageKeys.length; index += 50) {
    batches.push(imageKeys.slice(index, index + 50));
  }

  const queries = useQueries({
    queries: batches.map((batch) => ({
      queryKey: ["communityViewUrls", batch],
      queryFn: () => CommunityApi.getViewUrls(batch),
      staleTime: VIEW_URL_STALE_TIME,
    })),
  });

  const urls: Record<string, string> = {};
  queries.forEach((query) => {
    query.data?.items.forEach(({ imageKey, uploadUrl }) => {
      urls[imageKey] = uploadUrl;
    });
  });

  return {
    urls,
    isLoading: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError),
  };
}

export function resolveCommunityImageUri(
  imageKey: string | null | undefined,
  urls: Record<string, string>,
  fallbackUrl?: string | null,
  failedUris?: Record<string, boolean>,
): string | undefined {
  if (imageKey && isDirectImageUri(imageKey) && !failedUris?.[imageKey]) {
    return imageKey;
  }
  if (imageKey && urls[imageKey] && !failedUris?.[urls[imageKey]]) {
    return urls[imageKey];
  }
  if (
    fallbackUrl &&
    isDirectImageUri(fallbackUrl) &&
    !failedUris?.[fallbackUrl]
  ) {
    return fallbackUrl;
  }
  return undefined;
}
