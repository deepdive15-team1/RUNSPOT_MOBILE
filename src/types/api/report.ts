export type ReportTargetType = "POST" | "COMMENT" | "CHAT_MESSAGE" | "USER";
export type ReportReasonCode = "SPAM" | "ABUSE" | "SEXUAL" | "FRAUD" | "ETC";

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reasonCode: ReportReasonCode;
  detail: string;
}
