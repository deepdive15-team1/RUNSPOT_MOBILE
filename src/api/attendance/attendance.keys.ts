export const attendanceKey = {
  all: (sessionId: number) => ["attendance", sessionId] as const,
};
