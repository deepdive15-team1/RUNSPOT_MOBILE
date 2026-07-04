import { colors } from "./theme";

export const GENDER_MAP: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
};

export const getGenderColor = (gender: string) => {
  return gender === "MALE" ? colors.main : colors.red600;
};
