import type { GenderPolicy, RunType } from "../types/search/search";

export const GENDER_INFO: Record<
  GenderPolicy,
  { label: string; color: "default" | "green" }
> = {
  MALE_ONLY: { label: "남성", color: "default" },
  FEMALE_ONLY: { label: "여성", color: "default" },
  MIXED: { label: "남녀무관", color: "green" },
};

export const RUN_TYPE_INFO: Record<
  RunType,
  { label: string; color: "primary" | "red" | "yellow" }
> = {
  RECOVERY: { label: "리커버리", color: "primary" },
  INTERVAL: { label: "인터벌", color: "red" },
  LSD: { label: "LSD", color: "yellow" },
};
