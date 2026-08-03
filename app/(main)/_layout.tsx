import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

import { colors, fontSizes, fontWeights } from "@/src/constants";

type IonName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IonName) {
  return function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
  };
}

export default function MainLayout() {
  const isChatEnabled = process.env.EXPO_PUBLIC_ENABLE_CHAT === "true";

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: {
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.bold,
          color: colors.gray600,
        },
        headerShadowVisible: true,
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          borderTopWidth: 2,
          borderTopColor: colors.gray200,
          backgroundColor: colors.bg,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarLabel: "홈",
          headerShown: false,
          tabBarIcon: tabIcon("home"),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "탐색",
          tabBarLabel: "탐색",
          tabBarIcon: tabIcon("search"),
        }}
      />
      {/*
       * TODO: 1차 MVP 배포 스펙에서 채팅 기능 제외
       * 사유: 채팅 기능 구현 연기
       * 해제 조건: 1차 배포 후 기능 구현 시 EXPO_PUBLIC_ENABLE_CHAT 제거 및 활성화
       */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarLabel: "채팅",
          tabBarIcon: tabIcon("chatbubbles-outline"),
          href: isChatEnabled ? "/chat" : null,
        }}
      />
      <Tabs.Screen
        name="my-page"
        options={{
          title: "마이",
          tabBarLabel: "마이",
          tabBarIcon: tabIcon("person-outline"),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
