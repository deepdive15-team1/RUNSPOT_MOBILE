import { CreateReportRequest } from "@/src/types/api/report";

export const createReport = async (
  _data: CreateReportRequest,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
};
