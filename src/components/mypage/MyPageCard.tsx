import { View, Text, StyleSheet, Pressable } from "react-native";

import { colors, spacing, fontSizes, fontWeights } from "@/src/constants";

interface RunCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

export function MyPageCard({
  title,
  subtitle,
  leftElement,
  rightElement,
  onPress,
}: RunCardProps) {
  return (
    <Pressable
      style={styles.cardContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      {leftElement && <View style={styles.leftWrapper}>{leftElement}</View>}

      <View style={styles.contentWrapper}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle &&
          (typeof subtitle === "string" ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : (
            subtitle
          ))}
      </View>

      {rightElement && <View style={styles.rightWrapper}>{rightElement}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftWrapper: {
    marginRight: spacing.md,
  },
  contentWrapper: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  rightWrapper: {
    marginLeft: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
