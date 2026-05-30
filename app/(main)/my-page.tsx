import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ProfileSection,
  CreatedRunsSection,
  AppliedRunsSection,
  RecentHistorySection,
} from "../../src/components/mypage/Sections";

import { logout } from "@/src/api/auth/authApi.index";
import RightArrowSvg from "@/src/assets/icon/my-page/rightarrow.svg";
import SettingSvg from "@/src/assets/icon/my-page/setting.svg";
import {
  colors,
  spacing,
  fontSizes,
  fontWeights,
  zIndex,
  borderRadius,
} from "@/src/constants";
import { useMyPageQueries } from "@/src/hooks/mypage/useMyPageQueries";

export default function MyPageScreen() {
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const queryClient = useQueryClient();

  const [profileQuery, createdQuery, appliedQuery, historyQuery] =
    useMyPageQueries();

  const isRefetching = [
    profileQuery,
    createdQuery,
    appliedQuery,
    historyQuery,
  ].some((query) => query.isRefetching);

  const router = useRouter();

  const isTotalLoading = [
    profileQuery,
    createdQuery,
    appliedQuery,
    historyQuery,
  ].some((query) => query.isLoading);

  const onRefresh = async () => {
    await Promise.all([
      profileQuery.refetch(),
      createdQuery.refetch(),
      appliedQuery.refetch(),
      historyQuery.refetch(),
    ]);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("서버 로그아웃에 실패하였습니다.", error);
          } finally {
            queryClient.clear();
            setSettingsVisible(false);
            router.replace("/login");
          }
        },
      },
    ]);
  };

  if (isTotalLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.totalLoadingText}>
          러닝 정보를 불러오는 중입니다
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <Pressable onPress={() => setSettingsVisible(true)} hitSlop={10}>
          <SettingSvg width={24} height={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ProfileSection
          data={profileQuery.data}
          isFetching={profileQuery.isFetching}
          isError={profileQuery.isError}
          onRetry={profileQuery.refetch}
        />
        <CreatedRunsSection
          data={createdQuery.data}
          isFetching={createdQuery.isFetching}
          isError={createdQuery.isError}
          onRetry={createdQuery.refetch}
        />
        <AppliedRunsSection
          data={appliedQuery.data}
          isFetching={appliedQuery.isFetching}
          isError={appliedQuery.isError}
          onRetry={appliedQuery.refetch}
        />
        <RecentHistorySection
          data={historyQuery.data}
          isFetching={historyQuery.isFetching}
          isError={historyQuery.isError}
          onRetry={historyQuery.refetch}
        />
      </ScrollView>

      <Modal
        visible={isSettingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSettingsVisible(false)}
          />

          <View style={styles.modalContent}>
            <Pressable style={styles.modalItem} onPress={handleLogout}>
              <Text style={styles.modalItemText}>로그아웃</Text>
              <RightArrowSvg
                width={20}
                height={20}
                color={colors.textSecondary}
              />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.modalItem}
              // TODO: 회원탈퇴 로직 추가
              // eslint-disable-next-line no-console
              onPress={() => console.log("회원탈퇴 로직")}
            >
              <Text style={styles.modalItemText}>회원탈퇴</Text>
              <RightArrowSvg
                width={20}
                height={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSecondary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  scrollContent: { paddingBottom: spacing.xxl },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: zIndex.modal,
  },
  modalContent: {
    width: "80%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
  },
  modalItemText: { fontSize: fontSizes.base, color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight },
  totalLoadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});
