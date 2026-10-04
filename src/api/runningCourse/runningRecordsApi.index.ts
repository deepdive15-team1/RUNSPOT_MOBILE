import * as realAPI from "./runningRecordsApi";
import * as mockAPI from "./runningRecordsApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const RunningRecordApi = {
  getMyRunningRecords: isMock
    ? mockAPI.getMyRunningRecords
    : realAPI.getMyRunningRecords,
};
