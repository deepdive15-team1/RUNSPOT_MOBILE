import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import { NotificationApi } from "@/src/api/notification/notificationApi.index";
import BellSvg from "@/src/assets/icon/notification/bell.svg";
import { colors } from "@/src/constants";
import { notificationKeys } from "@/src/constants/queryKeys";

interface NotificationBellProps {
  width?: number;
  height?: number;
  color?: string;
}

export function NotificationBell({
  width = 24,
  height = 24,
  color,
}: NotificationBellProps) {
  const { data, refetch } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: NotificationApi.getUnreadCount,
    staleTime: 1000 * 30,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const count = data?.unreadCount || 0;
  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <View style={styles.container}>
      <BellSvg width={width} height={height} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{displayCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
});
