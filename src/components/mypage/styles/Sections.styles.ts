import { StyleSheet } from "react-native";

import {
  spacing,
  fontSizes,
  fontWeights,
  colors,
  borderRadius,
} from "@/src/constants";

export const styles = StyleSheet.create({
  sectionContainer: { marginTop: spacing.xl, paddingHorizontal: spacing.base },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardListWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  profileContainer: {
    backgroundColor: colors.white,
    margin: spacing.base,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  profileInfo: { flex: 1, alignItems: "flex-start", gap: spacing.xxs },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  demographics: { fontSize: fontSizes.sm, color: colors.textSecondary },
  mannerChip: { marginTop: spacing.xs },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statBox: {
    width: "48%",
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  statValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  chatIcon: {
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
  },
  dateBox: {
    backgroundColor: colors.mainLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  dateBoxText: {
    color: colors.main,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  subtitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  subtitleText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  rightActionStack: {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
  },
  centerBox: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,

    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs,
  },
});
