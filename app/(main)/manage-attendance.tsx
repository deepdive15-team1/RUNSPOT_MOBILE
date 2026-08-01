import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { router, Tabs, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { attendanceKey } from "@/src/api/attendance/attendance.keys";
import { getAttendance } from "@/src/api/attendance/attendanceApi.index";
import {
  kickOutParticipant,
  finishSession,
} from "@/src/api/session/sessionApi.index";
import { getSessionDetail } from "@/src/api/session-detail/sessionDetailApi.index";
import AttendanceSvg from "@/src/assets/icon/attendance/attendance.svg";
import AttendanceCalendarSvg from "@/src/assets/icon/attendance/attendanceCalendar.svg";
import { Button } from "@/src/components/common/button/Button";
import ConfirmModal from "@/src/components/common/modal/ConfirmModal";
import ManageListItem from "@/src/components/manageParticipants/ManageListItem";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
} from "@/src/constants";
import { AttendanceMember } from "@/src/types/api/attendance";
import { formatDate } from "@/src/utils/date";

export default function ManageAttendanceScreen() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);

  // 내보낼 대상 유저를 임시로 담아두는 상태 (이 값이 있으면 내보내기 확인 모달이 열림)
  const [targetUser, setTargetUser] = useState<AttendanceMember | null>(null);

  // 상단 헤더에 보여줄 세션 정보(제목, 날짜) 가져오기
  const { data: sessionInfo } = useQuery({
    queryKey: ["sessionDetail", sessionId],
    queryFn: async () => {
      const response = await getSessionDetail(sessionId);
      return { title: response.title, date: response.startAt };
    },
  });

  // 참여자 명단 패칭
  const {
    data: members = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: attendanceKey.all(sessionId),
    queryFn: () => getAttendance(sessionId),
    // 출석(ATTENDED) 상태로 확정된 인원만 관리 화면 리스트에 보여주기 위해 필터링
    select: (allMembers) => {
      return allMembers.filter(
        (member) => member.attendanceStatus === "ATTENDED",
      );
    },
  });

  // 리스트에서 내보내기 버튼 클릭 시, 해당 유저를 targetUser로 지정해서 모달을 띄움
  const handlePressKickOut = useCallback((user: AttendanceMember) => {
    setTargetUser(user);
  }, []);

  // [내보내기] 모달에서 최종 '확인'을 눌렀을 때 실행되는 강퇴 API
  const kickOutMutation = useMutation({
    mutationFn: async (participationId: number) => {
      return kickOutParticipant(sessionId, participationId);
    },
    onSuccess: () => {
      // 내보내기 성공하면 모달 닫고, 명단 최신화(다시 불러오기)
      setTargetUser(null);
      queryClient.invalidateQueries({ queryKey: attendanceKey.all(sessionId) });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      // 기본 에러 메시지 세팅
      let alertMessage =
        "참여자 내보내기에 실패했습니다.\n네트워크 상태를 확인해주세요.";

      // 서버에서 커스텀 에러를 뱉어줬다면 그걸 화면에 띄워줌
      if (error.response?.data?.message) {
        alertMessage = error.response.data.message;
      }

      Alert.alert("오류", alertMessage);
      setTargetUser(null); // 에러 발생 시에도 모달은 닫아줌
    },
  });

  // 하단 러닝 종료 버튼 눌렀을 때 실행
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return finishSession(sessionId);
    },
    onSuccess: () => {
      Alert.alert("안내", "러닝이 종료되었습니다.", [
        // 뒤로가기 스택이 꼬이지 않도록 push 대신 replace로 홈 화면으로 보냄
        { text: "확인", onPress: () => router.replace("/") },
      ]);
    },
    onError: () => {
      Alert.alert("오류", "러닝 종료 처리에 실패했습니다.");
    },
  });

  // FlatList 아이템 렌더링
  const renderItem = useCallback(
    ({ item, index }: { item: AttendanceMember; index: number }) => {
      const isLastItem = index === members.length - 1;
      return (
        <View
          style={[
            styles.flatListItem,
            index === 0 && styles.flatListFirstItem,
            isLastItem && styles.flatListLastItem,
          ]}
        >
          <ManageListItem
            participant={item}
            isLastItem={isLastItem}
            onPressKickOut={handlePressKickOut}
          />
        </View>
      );
    },
    [members.length, handlePressKickOut],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.listHeaderLeft}>
          <AttendanceSvg width={24} height={24} />
          <Text style={styles.listTitle}>참여 멤버 ({members.length}명)</Text>
        </View>
      </View>
    ),
    [members.length],
  );

  const listFooter = useMemo(
    () => (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>🚨 내보내기 후 취소가 불가능합니다.</Text>
      </View>
    ),
    [],
  );

  // 로딩 및 에러 화면 처리
  if (isLoading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ flex: 1 }}
      />
    );
  if (isError)
    return <Text style={styles.errorText}>명단을 불러오지 못했습니다.</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tabs.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerMainText}>참여자 관리</Text>
              <View style={styles.headerSubTextContainer}>
                <AttendanceCalendarSvg width={14} height={14} />
                <Text style={styles.headerSubText}>
                  {formatDate(sessionInfo?.date ?? "")} |{" "}
                  {sessionInfo?.title ?? ""}
                </Text>
              </View>
            </View>
          ),
        }}
      />

      {/* 필터링된 참여자 리스트 */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        ListFooterComponent={listFooter}
        ListFooterComponentStyle={{ marginTop: 24 }}
      />

      {/* 러닝 종료 (하단 고정 버튼) */}
      <View style={styles.bottomFixedArea}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={endSessionMutation.isPending}
          onPress={() => endSessionMutation.mutate()}
        >
          {endSessionMutation.isPending ? "처리 중..." : "러닝 종료"}
        </Button>
      </View>

      {/* 강퇴 재확인 모달 (targetUser 값이 있을 때만 화면에 보임) */}
      <ConfirmModal
        visible={!!targetUser}
        title={`${targetUser?.userName}님을 내보내시겠습니까?`}
        message="내보내기 후에는 취소할 수 없습니다."
        confirmText="내보내기"
        cancelText="취소"
        isPending={kickOutMutation.isPending}
        onConfirm={() => targetUser && kickOutMutation.mutate(targetUser.id)}
        onCancel={() => setTargetUser(null)} // 취소 시 상태를 비워서 모달을 닫아줌
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },

  // Header
  headerTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerMainText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.gray600,
  },
  headerSubTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxs,
    gap: spacing.xs,
  },

  headerSubText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  //  FlatList Item
  flatListItem: {
    backgroundColor: colors.bg,
  },
  flatListFirstItem: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: "hidden",
  },
  flatListLastItem: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    overflow: "hidden",
  },

  //  List Content
  scrollContent: {
    padding: 20,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  listHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  listTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.gray700,
    marginLeft: spacing.sm,
  },

  //  Info Box
  infoBox: {
    backgroundColor: colors.mainLight,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
  },
  infoText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    color: colors.error,
  },

  //  Bottom Area
  bottomFixedArea: {
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
