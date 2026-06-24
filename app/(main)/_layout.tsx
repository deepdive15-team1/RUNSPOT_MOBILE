import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

import { StackHeaderBack } from "@/src/components/header";
import { colors, fontSizes, fontWeights } from "@/src/constants";

type IonName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IonName) {
  return function TabBarIcon({ color, size }: { color: string; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
  };
}

export default function MainLayout() {
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
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarLabel: "채팅",
          tabBarIcon: tabIcon("chatbubbles-outline"),
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
      <Tabs.Screen
        name="create-session"
        options={{
          title: "러닝 모임 만들기",
          href: null,
          headerLeft: () => <StackHeaderBack />,
        }}
      />
      <Tabs.Screen
        name="draw-running-course"
        options={{
          title: "러닝 코스 그리기",
          href: null,
          headerLeft: () => <StackHeaderBack />,
        }}
      />
      <Tabs.Screen
        name="search-result"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="session-detail"
        options={{
          href: null,
          title: "상세 정보",
          headerLeft: () => <StackHeaderBack />,
        }}
      />
    </Tabs>
  );
}
