import { ReactNode } from "react";
import { StyleSheet, View, Text } from "react-native";

import {
  colors,
  borderRadius,
  spacing,
  fontSizes,
  fontWeights,
} from "@/src/constants";

interface EmptyStateProps {
  text: string;
  icon?: ReactNode;
}

export function EmptyState({ text, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  iconWrapper: {
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
});
