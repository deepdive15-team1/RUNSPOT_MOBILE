import { createReport as realCreateReport } from "./reportApi";
import { createReport as mockCreateReport } from "./reportApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const ReportApi = {
  createReport: isMock ? mockCreateReport : realCreateReport,
};
