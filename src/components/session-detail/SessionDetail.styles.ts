import { StyleSheet } from "react-native";

import { colors, spacing, fontSizes, fontWeights } from "@/src/constants";

export const SessionDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  mapContainer: {
    width: "100%",
    height: 200,
    backgroundColor: colors.gray200,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subTitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoTextGroup: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.md,
  },
  hostProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  participantList: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -10,
    borderWidth: 1,
    borderColor: colors.bg,
  },
  participantsText: {
    color: colors.white,
    fontSize: fontSizes.sm,
  },
  hostInfo: {
    gap: 4,
    alignItems: "flex-start",
  },
  hostName: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
  submitSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    color: colors.gray500,
    fontSize: fontSizes.sm,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
  },
});
