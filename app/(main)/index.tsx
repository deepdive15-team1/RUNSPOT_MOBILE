import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/src/components/common/button/Button";
import { HomeHeader } from "@/src/components/home/HomeHeader";
import { NearbyList } from "@/src/components/nearbyList/NearbyList";
import { colors, spacing } from "@/src/constants";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <HomeHeader />

      <View style={styles.createBtnOuter}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/(main)/create-session")}
        >
          러닝 세션 개설하기
        </Button>
      </View>

      <NearbyList x={127.0017} y={37.5642} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "stretch",
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  createBtnOuter: {
    width: "90%",
    maxWidth: 330,
    alignSelf: "center",
  },
});
