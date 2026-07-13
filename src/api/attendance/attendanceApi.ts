import { axiosInstance } from "../axiosInstance";

import {
  UpdateAttendanceParams,
  AttendanceMember,
} from "@/src/types/api/attendance";

export const getAttendance = async (
  sessionId: number,
): Promise<AttendanceMember[]> => {
  const response = await axiosInstance.get<AttendanceMember[]>(
    `/sessions/${sessionId}/attendance`,
  );
  return response.data;
};

export const updateAttendance = async ({
  sessionId,
  participationId,
  status,
}: UpdateAttendanceParams) => {
  const url = `/sessions/${sessionId}/participants/${participationId}/attendance`;
  const response = await axiosInstance.patch(url, { attendanceStatus: status });

  return response.data;
};
