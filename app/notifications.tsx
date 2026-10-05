import { Ionicons } from "@expo/vector-icons";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  acceptParticipant,
  rejectParticipant,
} from "@/src/api/manageParticipants/manageParticipants.index";
import { NotificationApi } from "@/src/api/notification/notificationApi.index";
import { Button } from "@/src/components/common/button/Button";
import { colors, fontSizes, spacing } from "@/src/constants";
import { NOTIFICATION_ICON_MAP } from "@/src/constants/mappings";
import { notificationKeys } from "@/src/constants/queryKeys";
import type {
  NotificationItem,
  NotificationListResponse,
} from "@/src/types/api/notification";
import {
  handleNotificationRouting,
  parseId,
  parseString,
} from "@/src/utils/notificationRouting";

interface ParticipantActionVariables {
  sessionId: number;
  participationId: number;
  notificationId: number;
}

export default function NotificationScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const listQueryKey = notificationKeys.list(true);
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: NotificationApi.getUnreadCount,
  });

  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: listQueryKey,
      queryFn: ({ pageParam }) =>
        NotificationApi.getNotifications(pageParam, 20, true),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasNext && lastPage.nextCursorId != null
          ? lastPage.nextCursorId
          : undefined,
    });

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchUnreadCount();
    }, [refetch, refetchUnreadCount]),
  );

  const readMutation = useMutation({
    mutationFn: NotificationApi.readNotification,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: listQueryKey });

      const previousData = queryClient.getQueryData(listQueryKey);

      queryClient.setQueryData(
        listQueryKey,

        (old: InfiniteData<NotificationListResponse> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: NotificationListResponse) => ({
              ...page,
              notifications: page.notifications.filter(
                (notification: NotificationItem) =>
                  notification.id !== notificationId,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(listQueryKey, context.previousData);
      }
    },
  });

  const readAllMutation = useMutation({
    mutationFn: NotificationApi.readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });

  const markActionNotificationRead = async (notificationId: number) => {
    try {
      await NotificationApi.readNotification(notificationId);
    } catch {
      Alert.alert(
        "안내",
        "참여 요청은 처리됐지만 알림을 읽음 처리하지 못했습니다.",
      );
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    }
  };

  const acceptMutation = useMutation({
    mutationFn: (variables: ParticipantActionVariables) =>
      acceptParticipant(variables.sessionId, variables.participationId),
    onSuccess: async (_data, { notificationId }) => {
      Alert.alert("안내", "참여를 수락했습니다.");
      await markActionNotificationRead(notificationId);
    },
    onError: async () => {
      Alert.alert("오류", "수락 처리 중 오류가 발생했습니다.");
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (variables: ParticipantActionVariables) =>
      rejectParticipant(variables.sessionId, variables.participationId),
    onSuccess: async (_data, { notificationId }) => {
      Alert.alert("안내", "참여를 거절했습니다.");
      await markActionNotificationRead(notificationId);
    },
    onError: async () => {
      Alert.alert("오류", "거절 처리 중 오류가 발생했습니다.");
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
    },
  });

  const renderIcon = (type: string) => {
    const iconData =
      NOTIFICATION_ICON_MAP[type] || NOTIFICATION_ICON_MAP.CANCELED;
    return (
      <View style={[styles.iconCircle, { backgroundColor: colors.gray100 }]}>
        <Ionicons name={iconData.name} size={20} color={iconData.color} />
      </View>
    );
  };

  const handlePressNotification = (item: NotificationItem) => {
    if (!item.read) {
      readMutation.mutate(item.id);
    }
    handleNotificationRouting(
      {
        type: item.type,
        sessionId: parseId(item.sessionId),
        title: parseString(item.title),
        body: parseString(item.body),
      },
      router,
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const formattedTime = new Date(item.createdAt).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Pressable
        style={[styles.itemContainer, !item.read && styles.unreadItem]}
        onPress={() => handlePressNotification(item)}
      >
        <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{item.title}</Text>
          {item.type === "PARTICIPATION_REQUESTED" && item.actor?.name ? (
            <Text style={styles.actorText}>신청자: {item.actor.name}</Text>
          ) : null}
          <Text style={styles.messageText}>{item.body}</Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
          {item.type === "PARTICIPATION_REQUESTED" &&
            item.actionStatus === "PENDING" &&
            item.participationId != null && (
              <View style={styles.buttonRow}>
                <Button
                  variant="primary"
                  size="sm"
                  wrapperStyle={styles.actionButton}
                  disabled={
                    acceptMutation.isPending || rejectMutation.isPending
                  }
                  onPress={(e) => {
                    e.stopPropagation?.();
                    acceptMutation.mutate({
                      sessionId: item.sessionId,
                      participationId: item.participationId!,
                      notificationId: item.id,
                    });
                  }}
                >
                  {acceptMutation.isPending &&
                  acceptMutation.variables?.notificationId === item.id
                    ? "수락 중..."
                    : "수락"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  wrapperStyle={styles.actionButton}
                  disabled={
                    acceptMutation.isPending || rejectMutation.isPending
                  }
                  onPress={(e) => {
                    e.stopPropagation?.();
                    Alert.alert(
                      "참여 요청 거절",
                      `${item.actor?.name ?? "신청자"}님의 참여 요청을 거절할까요?`,
                      [
                        { text: "취소", style: "cancel" },
                        {
                          text: "거절",
                          style: "destructive",
                          onPress: () =>
                            rejectMutation.mutate({
                              sessionId: item.sessionId,
                              participationId: item.participationId!,
                              notificationId: item.id,
                            }),
                        },
                      ],
                    );
                  }}
                >
                  {rejectMutation.isPending &&
                  rejectMutation.variables?.notificationId === item.id
                    ? "거절 중..."
                    : "거절"}
                </Button>
              </View>
            )}
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!unreadCountData?.unreadCount) {
      return null;
    }
    return (
      <View style={styles.allReadButton}>
        <Button
          variant="text"
          onPress={() => readAllMutation.mutate()}
          disabled={readAllMutation.isPending}
          wrapperStyle={{ alignSelf: "flex-end" }}
        >
          모두 읽기
        </Button>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "알림", headerTitleAlign: "center" }} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>읽지 않은 알림이 없습니다.</Text>
        }
        ListFooterComponent={renderFooter}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: "center", alignItems: "center" },
  listContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  emptyText: {
    marginTop: spacing.xxl,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: fontSizes.base,
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.bg,
  },
  unreadItem: { backgroundColor: colors.mainLight },
  iconContainer: { marginRight: spacing.lg },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: { flex: 1, gap: spacing.xs },
  messageText: { fontSize: fontSizes.base, color: colors.text, lineHeight: 24 },
  titleText: {
    fontSize: fontSizes.base,
    color: colors.text,
    fontWeight: "600",
  },
  actorText: { fontSize: fontSizes.sm, color: colors.textMuted },
  timeText: { fontSize: fontSizes.sm, color: colors.textMuted, marginTop: 4 },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: "center",
  },
  actionButton: {
    minWidth: 80,
    paddingHorizontal: 16,
  },

  allReadButton: {
    width: "100%",
    paddingVertical: spacing.md,
    paddingHorizontal: 20,
    alignItems: "flex-end",
  },
});
