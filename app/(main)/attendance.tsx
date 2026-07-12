import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Tabs, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
import {
  getAttendance,
  updateAttendance,
} from "@/src/api/attendance/attendanceApi.index";
import { getSessionDetail } from "@/src/api/session-detail/sessionDetailApi.index";
import AttendanceSvg from "@/src/assets/icon/attendance/attendance.svg";
import AttendanceCalendarSvg from "@/src/assets/icon/attendance/attendanceCalendar.svg";
import AttendanceMemberCard from "@/src/components/attendance/AttendanceMemberCard";
import { Button } from "@/src/components/common/button/Button";
import Chip from "@/src/components/common/chip";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
} from "@/src/constants";
import { AttendanceMember, AttendanceStatus } from "@/src/types/api/attendance";
import { CreatedRunningResponse } from "@/src/types/api/mypage";
import { formatDate } from "@/src/utils/date";

export default function AttendanceScreen() {
  // 임시 저장소 (누를 때마다 API 호출 없이 변경된 출석 상태 저장)
  const [pendingChanges, setPendingChanges] = useState<
    Record<number, AttendanceStatus>
  >({});
  const queryClient = useQueryClient();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const sessionId = Number(id);

  // 마이페이지 캐시에서 세션 정보 가져와 헤더 즉시 렌더링
  const { data: sessionInfo } = useQuery({
    queryKey: ["sessionDetail", sessionId],
    queryFn: async () => {
      const response = await getSessionDetail(sessionId);
      return {
        title: response.title,
        date: response.startAt,
      };
    },
    initialData: () => {
      const appliedRuns = queryClient.getQueryData<CreatedRunningResponse>([
        "myPage",
        "createdRuns",
      ]);

      const cachedSession = appliedRuns?.find((run) => run.id === sessionId);

      if (cachedSession) {
        return {
          title: cachedSession.title,
          date: cachedSession.startAt,
        };
      }

      return undefined;
    },
  });

  const title = sessionInfo?.title ?? "";
  const date = sessionInfo?.date ?? "";

  // 원본 출석 데이터 패칭
  const { data, isError, isLoading } = useQuery({
    queryKey: attendanceKey.all(sessionId),
    queryFn: () => getAttendance(sessionId),
  });

  // Promise.all을 활용한 출석 상태 병렬 업데이트
  const updateAttendanceMutation = useMutation({
    mutationFn: async (changes: Record<number, AttendanceStatus>) => {
      const promises = Object.entries(changes).map(([pId, status]) => {
        return updateAttendance({
          sessionId,
          participationId: Number(pId),
          status,
        });
      });
      return Promise.all(promises);
    },

    onSuccess: () => {
      setPendingChanges({});
      queryClient.invalidateQueries({ queryKey: ["attendance", sessionId] });

      // 성공 시 출석 관리 화면 이동
      router.push({
        pathname: "/manage-attendance",
        params: { id: sessionId },
      });
    },
    onError: (error) => {
      console.error("출석 업데이트 중 에러 발생:", error);
      // 무한 루프 방지 및 재시도 유도
      Alert.alert(
        "출석 업데이트에 실패하였습니다.",
        "잠시후 다시 시도해주세요",
        [
          {
            text: "확인",
          },
        ],
      );
    },
  });

  const onRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: attendanceKey.all(sessionId) });
  };

  // 원본 데이터 캐싱
  const members = React.useMemo(() => {
    return data ?? [];
  }, [data]);

  // 화면 표시용 데이터
  const displayMembers = React.useMemo(() => {
    return members.map((member) => ({
      ...member,
      attendanceStatus: pendingChanges[member.id] ?? member.attendanceStatus,
    }));
  }, [members, pendingChanges]);

  const totalCount = members.length;

  // 현재 출석 인원 카운트
  const attendedCount = React.useMemo(() => {
    return displayMembers.filter((m) => m.attendanceStatus === "ATTENDED")
      .length;
  }, [displayMembers]);

  // 출석 토글 핸들러
  const handleToggleStatus = React.useCallback(
    (participationId: number, currentStatus: AttendanceStatus) => {
      setPendingChanges((prev) => {
        const newStatus = currentStatus === "ATTENDED" ? "ABSENT" : "ATTENDED";

        const originalStatus = members.find(
          (m) => m.id === participationId,
        )?.attendanceStatus;

        const nextChanges = { ...prev };

        // 원본 상태와 동일해지면 임시 저장소에서 삭제
        if (originalStatus === newStatus) {
          delete nextChanges[participationId];
        } else {
          nextChanges[participationId] = newStatus;
        }

        return nextChanges;
      });
    },
    [members],
  );

  // FlatList 아이템 렌더링 함수
  const renderAttendanceItem = React.useCallback(
    ({ item, index }: { item: AttendanceMember; index: number }) => {
      const isLastItem = index === displayMembers.length - 1;

      return (
        // 첫 아이템과 끝 아이템 개별 라운딩 처리
        <View
          style={[
            styles.flatListItem,
            index === 0 && styles.flatListFirstItem,
            isLastItem && styles.flatListLastItem,
          ]}
        >
          <AttendanceMemberCard
            participant={item}
            isLastItem={isLastItem}
            onToggleStatus={handleToggleStatus}
          />
        </View>
      );
    },
    [displayMembers.length, handleToggleStatus],
  );

  // FlatList 헤더 JSX 캐싱
  const listHeader = React.useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.listHeaderLeft}>
          <AttendanceSvg width={24} height={24} />
          <Text style={styles.listTitle}>참여 예정 멤버 ({totalCount}명)</Text>
        </View>
        <Chip
          label={`현재 ${attendedCount}명 출석`}
          color="primary"
          size="small"
          variant="filled"
        />
      </View>
    ),
    [totalCount, attendedCount],
  );

  // FlatList 푸터 JSX 캐싱
  const listFooter = React.useMemo(
    () => (
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 모든 멤버의 출석 여부를 확인한 후 출석 완료 버튼을 눌러주세요.
          출석이 완료되면 러닝 세션이 공식적으로 시작됩니다.
        </Text>
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>참여자 명단을 불러오는 중입니다</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>참여자 명단을 불러오지 못했습니다.</Text>
        <Button variant="outline" size="sm" onPress={onRefresh}>
          다시 시도
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tabs.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerMainText}>출석 체크</Text>
              <View style={styles.headerSubTextContainer}>
                <AttendanceCalendarSvg width={14} height={14} />
                <Text style={styles.headerSubText}>
                  {formatDate(date)} | {title}
                </Text>
              </View>
            </View>
          ),
        }}
      />

      {/* MIDDLE 영역 */}
      <FlatList
        data={displayMembers}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={renderAttendanceItem}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        ListFooterComponent={listFooter}
        ListFooterComponentStyle={{ marginTop: 24 }}
        // FlatList 성능 및 메모리 관리 튜닝 옵션
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* BOTTOM 영역 */}
      <View style={styles.bottomFixedArea}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={updateAttendanceMutation.isPending}
          onPress={() => {
            const hasChanges = Object.keys(pendingChanges).length > 0;

            // 변경 내역 존재 여부에 따른 분기 처리 (내역 없으면 즉시 관리 화면 이동)
            if (hasChanges) {
              updateAttendanceMutation.mutate(pendingChanges);
            } else {
              router.push({
                pathname: "/manage-attendance",
                params: { id: sessionId },
              });
            }
          }}
        >
          {updateAttendanceMutation.isPending
            ? "처리 중..."
            : "출석 완료 및 러닝 시작"}
        </Button>
      </View>
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

  // ============ Header ============
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

  // ============ FlatList Item ============
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

  // ============ List Content ============
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

  // ============ Info Box ============
  infoBox: {
    backgroundColor: colors.mainLight,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
  },
  infoText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    color: colors.primary,
  },

  // ============ Bottom Area ============
  bottomFixedArea: {
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
