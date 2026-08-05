import { useQueries } from "@tanstack/react-query";

import {
  getProfile,
  getCreatedRuns,
  getAppliedRuns,
  getHistoryRuns,
} from "@/src/api/my-page/myPageApi.index";
import { myPageKeys } from "@/src/constants/queryKeys";

export function useMyPageQueries() {
  return useQueries({
    queries: [
      { queryKey: myPageKeys.profile(), queryFn: getProfile },
      { queryKey: myPageKeys.createdRuns(), queryFn: getCreatedRuns },
      { queryKey: myPageKeys.appliedRuns(), queryFn: getAppliedRuns },
      { queryKey: myPageKeys.historyRuns(), queryFn: getHistoryRuns },
    ],

    combine: (results) => {
      return {
        profileData: results[0].data,
        createdRunsData: results[1].data,
        appliedRunsData: results[2].data,
        historyRunsData: results[3].data,

        isTotalLoading: results.some((r) => r.isLoading),
        isRefetching: results.some((r) => r.isRefetching),

        refetchProfile: results[0].refetch,
        refetchCreatedRuns: results[1].refetch,
        refetchAppliedRuns: results[2].refetch,
        refetchHistoryRuns: results[3].refetch,

        isProfileError: results[0].isError,
        isCreatedRunsError: results[1].isError,
        isAppliedRunsError: results[2].isError,
        isHistoryRunsError: results[3].isError,

        isProfileFetching: results[0].isFetching,
        isCreatedRunsFetching: results[1].isFetching,
        isAppliedRunsFetching: results[2].isFetching,
        isHistoryRunsFetching: results[3].isFetching,
      };
    },
  });
}
