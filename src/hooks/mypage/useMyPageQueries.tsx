import { useQueries } from "@tanstack/react-query";

import {
  getProfile,
  getCreatedRuns,
  getAppliedRuns,
  getHistoryRuns,
} from "@/src/api/my-page/myPageApi.index";

export function useMyPageQueries() {
  return useQueries({
    queries: [
      { queryKey: ["myPage", "profile"], queryFn: getProfile },
      { queryKey: ["myPage", "createdRuns"], queryFn: getCreatedRuns },
      { queryKey: ["myPage", "appliedRuns"], queryFn: getAppliedRuns },
      { queryKey: ["myPage", "historyRuns"], queryFn: getHistoryRuns },
    ],
  });
}
