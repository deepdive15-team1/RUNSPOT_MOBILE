import { StyleSheet } from "react-native";

import {
  borderRadius,
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@/src/constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerRight: {
    width: 60,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  draftText: {
    fontSize: fontSizes.sm,
    color: colors.gray400,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.main,
  },
  tabText: {
    fontSize: fontSizes.base,
    color: colors.gray400,
    fontWeight: fontWeights.medium,
  },
  activeTabText: {
    color: colors.main,
    fontWeight: fontWeights.bold,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  scrollInner: {
    padding: spacing.base,
    gap: spacing.xl,
    backgroundColor: colors.bg,
    margin: spacing.base,
    borderRadius: borderRadius.lg,
    paddingBottom: 40,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },
  imageScroll: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 4,
  },
  cameraBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray100,
  },
  cameraText: {
    fontSize: fontSizes.xs,
    color: colors.gray400,
    marginTop: 4,
  },
  imagePreviewBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: "visible",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray200,
  },
  deleteIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  addCourseButton: {
    flexDirection: "row",
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.main,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.mainLight,
    gap: spacing.xs,
  },
  addCourseText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  courseCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    backgroundColor: colors.bg,
  },
  courseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  courseTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  courseDate: {
    fontSize: fontSizes.xs,
    color: colors.gray500,
    marginTop: 2,
  },
  courseStatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  courseStatBox: {
    flex: 1,
    alignItems: "center",
  },
  courseStatLabel: {
    fontSize: fontSizes.xs,
    color: colors.gray500,
    marginBottom: 2,
  },
  courseStatValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.main,
  },
  courseStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  courseMapPlaceholder: {
    height: 140,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  courseMapText: {
    fontSize: fontSizes.xs,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bottomFixed: {
    padding: spacing.base,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
