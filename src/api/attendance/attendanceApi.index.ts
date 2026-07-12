import {
  getAttendance as realGetAttendance,
  updateAttendance as realUpdateAttendance,
} from "./attendanceApi";
import {
  getAttendance as mockGetAttendance,
  updateAttendance as mockUpdateAttendance,
} from "./attendanceApi.mock";

const isMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const getAttendance = isMock ? mockGetAttendance : realGetAttendance;

export const updateAttendance = isMock
  ? mockUpdateAttendance
  : realUpdateAttendance;
