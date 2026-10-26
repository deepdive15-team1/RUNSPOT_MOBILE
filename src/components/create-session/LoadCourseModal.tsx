import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RunningRecordApi } from "@/src/api/runningCourse/runningRecordsApi.index";
import BackIcon from "@/src/assets/icon/back.svg";
import { Button } from "@/src/components/common/button/Button";
import { colors, spacing, fontSizes, borderRadius } from "@/src/constants";
import { runningRecordKeys } from "@/src/constants/queryKeys";
import { RunningRecordResponse } from "@/src/types/api/runningCourse";
import { PastCourse } from "@/src/types/domain/course";
import { paceStringToSeconds } from "@/src/utils";
import { formatDate } from "@/src/utils/date";

interface LoadCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (course: PastCourse) => void;
}

interface CourseItemProps {
  item: RunningRecordResponse;
  isSelected: boolean;
  onPress: (id: number) => void;
}

const CourseItem = React.memo(
  ({ item, isSelected, onPress }: CourseItemProps) => (
    <Pressable
      style={[styles.itemContainer, isSelected && styles.itemSelected]}
      onPress={() => onPress(item.runningRecordId)}
    >
      <View style={styles.itemImagePlaceholder}>
        {/* TODO: 추후 백엔드 제공 이미지로 교체 (이미지 로드 실패 시 현재 아이콘 사용) */}
        <Ionicons name="map-outline" size={24} color={colors.gray400} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{formatDate(item.recordedAt)}</Text>
        <Text style={styles.itemMeta}>
          {item.distanceKm}km | {item.avgPace}/km
        </Text>
      </View>
      <View style={styles.radioContainer}>
        <View
          style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </Pressable>
  ),
);

CourseItem.displayName = "CourseItem";

export default function LoadCourseModal({
  visible,
  onClose,
  onSelect,
}: LoadCourseModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: runningRecords, isLoading } = useQuery({
    queryKey: runningRecordKeys.mine(),
    queryFn: RunningRecordApi.getMyRunningRecords,
    enabled: visible,
  });

  const handleConfirm = () => {
    const selectedRecord = runningRecords?.find(
      (record) => record.runningRecordId === selectedId,
    );

    if (selectedRecord) {
      let routePolyline: { x: number; y: number }[] = [];
      try {
        const parsedRoute =
          typeof selectedRecord.routePolyline === "string"
            ? JSON.parse(selectedRecord.routePolyline || "[]")
            : selectedRecord.routePolyline;
        if (Array.isArray(parsedRoute)) {
          routePolyline = parsedRoute.filter(
            (point): point is { x: number; y: number } =>
              point !== null &&
              typeof point === "object" &&
              typeof point.x === "number" &&
              typeof point.y === "number",
          );
        }
      } catch (error) {
        console.warn("러닝 경로 데이터를 읽을 수 없습니다.", error);
      }

      const mappedCourse: PastCourse = {
        id: selectedRecord.runningRecordId,
        title: selectedRecord.title,
        createdAt: selectedRecord.recordedAt,
        targetDistanceKm: selectedRecord.distanceKm,
        avgPaceSec: paceStringToSeconds(selectedRecord.avgPace) ?? 360,
        locationName: selectedRecord.locationName,
        address: selectedRecord.locationDetail,
        routePolyline,
        markers: [],
      };

      onSelect(mappedCourse);

      setTimeout(() => setSelectedId(null), 300);
      onClose();
    }
  };

  const handleItemPress = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: RunningRecordResponse }) => (
      <CourseItem
        item={item}
        isSelected={selectedId === item.runningRecordId}
        onPress={handleItemPress}
      />
    ),
    [selectedId, handleItemPress],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Button
              onPress={onClose}
              variant="text"
              iconOnly
              startIcon={<BackIcon width={17} height={17} />}
            />
          </View>
          <Text style={styles.headerTitle}>러닝 코스 불러오기</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.main} />
            <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
          </View>
        ) : !runningRecords || runningRecords.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              연결할 수 있는 러닝 기록이 없습니다.
            </Text>
          </View>
        ) : (
          <FlatList
            data={runningRecords}
            keyExtractor={(item) => String(item.runningRecordId)}
            renderItem={renderItem}
            extraData={selectedId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.bottomFixed}>
          <Button
            variant="primary"
            fullWidth
            disabled={!selectedId}
            onPress={handleConfirm}
          >
            선택 코스 불러오기
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerLeft: {
    position: "absolute",
    left: spacing.base,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
  },
  listContent: { padding: spacing.base, gap: spacing.sm },
  itemContainer: {
    flexDirection: "row",
    padding: spacing.base,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  itemSelected: { borderColor: colors.main },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  itemContent: { flex: 1, gap: 2 },
  itemTitle: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  itemDate: { fontSize: fontSizes.xs, color: colors.textSecondary },
  itemMeta: { fontSize: fontSizes.xs, color: colors.gray600, marginTop: 2 },
  radioContainer: { paddingLeft: spacing.sm },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: colors.main },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.main,
  },
  bottomFixed: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.gray600,
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.gray500,
  },
});
