import { colors } from "./theme";

export const GENDER_MAP: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

export const getGenderColor = (gender: string) => {
  return gender === "MALE" ? colors.main : colors.red600;
};

export const AGEGROUPMAP: Record<string, string> = {
  "10S": "10대",
  "20S": "20대",
  "30S": "30대",
  "40S": "40대",
  "50S": "50대",
};
