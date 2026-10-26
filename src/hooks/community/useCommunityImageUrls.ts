import { useQueries } from "@tanstack/react-query";

import { CommunityApi } from "@/src/api/community/communityApi.index";
import { communityKeys } from "@/src/constants/queryKeys";

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

export function getCommunityImageKeysToResolve(
  keys: string[],
  fallbackUrls: Record<string, string> = {},
  failedUris: Record<string, boolean> = {},
): string[] {
  return Array.from(
    new Set(
      keys.filter((key) => {
        if (!key || isDirectImageUri(key)) return false;
        const fallbackUrl = fallbackUrls[key];
        return !fallbackUrl || !!failedUris[fallbackUrl];
      }),
    ),
  );
}

export function useCommunityImageUrls(
  keys: string[],
  fallbackUrls: Record<string, string> = {},
  failedUris: Record<string, boolean> = {},
) {
  const imageKeys = getCommunityImageKeysToResolve(
    keys,
    fallbackUrls,
    failedUris,
  );
  const batches: string[][] = [];
  for (let index = 0; index < imageKeys.length; index += 50) {
    batches.push(imageKeys.slice(index, index + 50));
  }

  const queries = useQueries({
    queries: batches.map((batch) => ({
      queryKey: communityKeys.viewUrls(batch),
      queryFn: () => CommunityApi.getViewUrls(batch),
      staleTime: VIEW_URL_STALE_TIME,
    })),
  });

  const urls: Record<string, string> = {};
  Object.entries(fallbackUrls).forEach(([imageKey, url]) => {
    if (!failedUris[url]) urls[imageKey] = url;
  });
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
