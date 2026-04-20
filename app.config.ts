import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "RUNSPOT_MOBILE",
  slug: "RUNSPOT_MOBILE",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./src/assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.runspot.app",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./src/assets/android-icon-foreground.png",
      backgroundImage: "./src/assets/android-icon-background.png",
      monochromeImage: "./src/assets/android-icon-monochrome.png",
    },
    package: "com.runspot.app",
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./src/assets/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "@mj-studio/react-native-naver-map",
      {
        client_id: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID,
        android: {
          ACCESS_FINE_LOCATION: true,
          ACCESS_COARSE_LOCATION: true,
        },
        ios: {
          NSLocationWhenInUseUsageDescription:
            "러닝 경로를 기록하기 위해 위치 정보가 필요합니다.",
        },
      },
    ],

    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: ["https://repository.map.naver.com/archive/maven"],
        },
      },
    ],
  ],
});
