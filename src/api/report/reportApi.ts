import { axiosInstance } from "../axiosInstance";

import { CreateReportRequest } from "@/src/types/api/report";

export const createReport = async (
  data: CreateReportRequest,
): Promise<void> => {
  await axiosInstance.post("/api/v1/reports", data);
};
