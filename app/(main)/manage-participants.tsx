import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  Tabs,
  useLocalSearchParams,
  useFocusEffect,
  router,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  closeSession,
  getParticipantsByStatus,
} from "@/src/api/manageParticipants/manageParticipants.index";
import { participantKeys } from "@/src/api/manageParticipants/manageParticipants.keys";
import { Button } from "@/src/components/common/button/Button";
import { ApprovedParticipantCard } from "@/src/components/manageParticipants/ApprovedParticipantCard";
import { ManageBottomBar } from "@/src/components/manageParticipants/ManageBottomBar";
import { RequestedParticipantCard } from "@/src/components/manageParticipants/RequestedParticipantCard";
import { EmptyState } from "@/src/components/mypage/EmptyState";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { RunningStatus } from "@/src/types/api/mypage";

export default function ManageParticipantsScreen() {
  const insets = useSafeAreaInsets();

  const queryClient = useQueryClient();

  const { id, title, status } = useLocalSearchParams<{
    id: string;
    title: string;
    status: RunningStatus;
  }>();

  const [sessionStatus, setSessionStatus] = useState(status);

  const sessionId = Number(id);

  const { requestedList, approvedList, isError, isLoading } = useQueries({
    queries: [
      {
        queryKey: participantKeys.status(sessionId, "REQUESTED"),
        queryFn: () => getParticipantsByStatus(sessionId, "REQUESTED"),
      },
      {
        queryKey: participantKeys.status(sessionId, "APPROVED"),
        queryFn: () => getParticipantsByStatus(sessionId, "APPROVED"),
      },
    ],

    combine: (results) => {
      return {
        requestedList: results[0].data ?? [],
        approvedList: results[1].data ?? [],

        isLoading: results[0].isLoading || results[1].isLoading,
        isError: results[0].isError || results[1].isError,
      };
    },
  });

  const { mutate: closeMutate, isPending: isCloseSession } = useMutation({
    mutationFn: () => closeSession(sessionId),

    onSuccess: () => {
      Alert.alert("마감 완료", "모집이 성공적으로 마감되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            setSessionStatus("CLOSED");
            queryClient.invalidateQueries({
              queryKey: participantKeys.all(sessionId),
            });
          },
        },
      ]);
    },

    onError: () => {
      Alert.alert("모집 마감에 실패하였습니다", "잠시후 다시 시도해주세요", [
        {
          text: "확인",
          onPress: () => {
            queryClient.invalidateQueries({
              queryKey: participantKeys.all(sessionId),
            });
          },
        },
      ]);
    },
  });

  useFocusEffect(
    useCallback(() => {
      // 화면에 다시 들어올 때마다 해당 세션의 데이터를 상한 데이터로 취급하여 즉시 백그라운드 재요청
      queryClient.invalidateQueries({
        queryKey: participantKeys.all(sessionId),
      });
    }, [sessionId, queryClient]),
  );

  const onRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: participantKeys.all(sessionId) });
  };

  const onClose = () => {
    Alert.alert(
      "모집 마감",
      "모집을 마감하시겠습니까?\n마감 후에는 새로운 신청을 받을 수 없습니다.",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "확인",
          style: "destructive",
          onPress: () => closeMutate(),
        },
      ],
      { cancelable: true },
    );
  };
  const onCheckStart = () => {
    if (sessionStatus === "OPEN") {
      Alert.alert("안내", "모집 마감을 한 뒤 출석 체크를 진행 해주세요");
      return;
    }

    router.push({
      pathname: "/attendance",
      params: { id: sessionId },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>참여자 정보를 불러오는 중입니다</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
        <Button variant="outline" size="sm" onPress={onRefresh}>
          다시 시도
        </Button>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Tabs.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerMainText}>참여자 관리</Text>
              <Text style={styles.headerSubText}>{title}</Text>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.approvedText}>
          신청 대기 ({requestedList.length}) 명
        </Text>

        {requestedList.length === 0 ? (
          <View style={styles.cardContainer}>
            <EmptyState text="아직 대기 중인 신청자가 없습니다." />
          </View>
        ) : (
          requestedList.map((participant) => (
            <RequestedParticipantCard
              key={participant.id}
              participant={participant}
              sessionId={sessionId}
            />
          ))
        )}

        <View>
          <Text style={styles.approvedText}>
            확정 멤버 ({approvedList.length}) 명
          </Text>
          <View style={styles.cardContainer}>
            {approvedList.length === 0 ? (
              <EmptyState text="확정 멤버가 없습니다." />
            ) : (
              approvedList.map((participant, index) => (
                <ApprovedParticipantCard
                  key={participant.id}
                  participant={participant}
                  isLast={index === approvedList.length - 1} // 마지막 요소인지 판별해서 넘김
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.fixedBottomBtn, { paddingBottom: insets.bottom }]}>
        <ManageBottomBar
          sessionId={sessionId}
          isClosed={sessionStatus}
          onClose={onClose}
          onCheckStart={onCheckStart}
          isCloseSession={isCloseSession}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSecondary },
  scrollContainer: { flex: 1 },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  centerBox: {
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
  },
  approvedText: {
    color: colors.black,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    marginLeft: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  cardContainer: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
  },
  fixedBottomBtn: {
    backgroundColor: colors.bg,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 12,
    paddingHorizontal: 12,
  },

  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  headerTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerMainText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.gray600,
  },
  headerSubText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
