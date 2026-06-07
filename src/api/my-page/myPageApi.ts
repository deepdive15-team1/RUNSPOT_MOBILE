import { axiosInstance } from "../axiosInstance";

import type {
  UserProfile,
  CreatedRunningResponse,
  AppliedRunningsResponse,
  RecentRunningsResponse,
} from "@/src/types/api/mypage";

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await axiosInstance.get<UserProfile>("/users/me");
  return data;
};

export const getCreatedRuns = async (): Promise<CreatedRunningResponse> => {
  const { data } = await axiosInstance.get<CreatedRunningResponse>(
    "/users/me/runnings/mySession",
    {
      params: {
        limit: 3,
      },
    },
  );
  return data;
};

export const getAppliedRuns = async (): Promise<AppliedRunningsResponse> => {
  const { data } = await axiosInstance.get<AppliedRunningsResponse>(
    "/users/me/runnings/applied",
    {
      params: {
        limit: 3,
      },
    },
  );

  return data;
};

export const getHistoryRuns = async (): Promise<RecentRunningsResponse> => {
  const { data } = await axiosInstance.get<RecentRunningsResponse>(
    "/users/me/runnings/recent",
    {
      params: {
        limit: 3,
      },
    },
  );

  return data;
};
