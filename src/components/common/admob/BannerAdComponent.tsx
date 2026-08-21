import { View, StyleSheet } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import { colors } from "@/src/constants";

// 개발 모드에서는 테스트 ID 사용
// 안드로이드 타겟 배포만 우선 진행하므로 안드로이드 ID만 매핑
const adUnitId = __DEV__
  ? TestIds.BANNER
  : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || "";

export function BannerAdComponent() {
  if (!adUnitId) return null;

  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSecondary,
    minHeight: 50,
  },
});
