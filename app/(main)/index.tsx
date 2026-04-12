import { View, Text, StyleSheet } from "react-native";

import { colors, spacing, fontSizes, fontWeights } from "@/src/constants";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.base,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
});
