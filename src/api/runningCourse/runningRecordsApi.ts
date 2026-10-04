import { axiosInstance } from "../axiosInstance";

import { RunningRecordResponse } from "@/src/types/api/runningCourse";

export const getMyRunningRecords = async (): Promise<
  RunningRecordResponse[]
> => {
  const response = await axiosInstance.get<RunningRecordResponse[]>(
    "/api/v1/me/running-records",
  );
  return response.data;
};
