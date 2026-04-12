import { View, Text, StyleSheet } from "react-native";

import { colors, spacing, fontSizes, fontWeights } from "@/src/constants";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>회원가입 페이지입니다.</Text>
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
  text: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    color: colors.text,
  },
});
