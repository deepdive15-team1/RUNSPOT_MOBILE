import { StyleSheet } from "react-native";

import { theme } from "@/src/constants";

export const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },

  searchInputContainer: {
    backgroundColor: theme.colors.gray100,
    borderWidth: 0,
    borderRadius: theme.borderRadius.full,
    height: 48,
  },
  summaryContainer: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  summaryText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.gray900,
  },
  listContentContainer: {
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
  },
  emptyText: {
    color: theme.colors.gray400,
    fontSize: theme.fontSizes.base,
  },
});
