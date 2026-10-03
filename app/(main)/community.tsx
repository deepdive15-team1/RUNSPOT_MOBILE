import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";

import { CommunityApi } from "@/src/api/community/communityApi.index";
import { ReportApi } from "@/src/api/report/reportApi.index";
import EditIcon from "@/src/assets/icon/community/edit.svg";
import SearchIcon from "@/src/assets/icon/search.svg";
import { Input } from "@/src/components/common/Input/Input";
import { BannerAdComponent } from "@/src/components/common/admob/BannerAdComponent";
import { Button } from "@/src/components/common/button/Button";
import { LoadingScreen } from "@/src/components/common/loading/LoadingScreen";
import { ReportModal } from "@/src/components/common/modal/ReportModal";
import PostCard, { type FeedPost } from "@/src/components/community/PostCard";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { BoardType, PostSort } from "@/src/types/api/community";
import { ReportReasonCode } from "@/src/types/api/report";
import { AnalyticsHelper } from "@/src/utils/analytics";

export default function CommunityScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<BoardType>("GENERAL");
  const [activeSort, setActiveSort] = useState<PostSort>("LATEST");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isReportVisible, setReportVisible] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["communityPosts", activeTab, activeSort, searchKeyword],
      initialPageParam: null as string | null,
      queryFn: ({ pageParam }) =>
        CommunityApi.getPosts({
          boardType: activeTab,
          sort: activeSort,
          q: searchKeyword,
          cursor: pageParam ?? undefined,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data],
  );

  const handleTabChange = useCallback((tab: BoardType) => {
    // [Analytics] 커뮤니티 탭 변경 트래픽 기록
    AnalyticsHelper.logEvent("community_tab_changed", { tab });
    setActiveTab(tab);
  }, []);

  const handlePressMore = useCallback((post: FeedPost) => {
    setSelectedPost(post);
    setMenuVisible(true);
  }, []);

  const handleReportSubmit = useCallback(
    async (reasonCode: ReportReasonCode, details: string) => {
      if (!selectedPost) return;

      try {
        await ReportApi.createReport({
          targetType: "POST",
          targetId: selectedPost.postId,
          reasonCode: reasonCode,
          detail: details,
        });

        // [Analytics] 게시글 신고 트래픽 기록
        AnalyticsHelper.logEvent("post_reported", {
          postId: selectedPost.postId,
          reasonCode,
        });
        Alert.alert("신고 완료", "신고가 정상적으로 접수되었습니다.");
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 409) {
            Alert.alert("알림", "이미 신고한 게시글입니다.");
            return;
          }
        }

        Alert.alert(
          "오류",
          "신고 접수에 실패했습니다. 잠시후 다시 시도해주세요.",
        );
      } finally {
        setReportVisible(false);
      }
    },
    [selectedPost],
  );

  const toggleScrapMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPost) return;
      await CommunityApi.scrapPost(selectedPost.postId);
    },
    onSuccess: () => {
      Alert.alert("알림", "관심 게시물로 저장되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["myScraps"] });
    },
    onError: () => {
      Alert.alert("오류", "관심 게시물 설정 중 문제가 발생했습니다.");
    },
  });

  const handleDeletePost = useCallback(() => {
    if (!selectedPost) return;
    setMenuVisible(false);

    Alert.alert("게시글 삭제", "정말로 이 게시글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await CommunityApi.deletePost(selectedPost.postId);

            AnalyticsHelper.logEvent("post_deleted", {
              postId: selectedPost.postId,
            });
            queryClient.invalidateQueries({ queryKey: ["communityPosts"] });

            Alert.alert("알림", "게시글이 삭제되었습니다.");
          } catch {
            Alert.alert("오류", "게시글 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  }, [selectedPost, queryClient]);

  const handlePressPost = useCallback(
    (id: string) => {
      // [Analytics] 게시글 상세 진입 클릭 트래픽 기록
      AnalyticsHelper.logEvent("post_clicked", { postId: id });
      router.push({ pathname: "/post-detail", params: { postId: id } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => (
      <PostCard
        post={item}
        onPressMore={handlePressMore}
        onPressPost={handlePressPost}
      />
    ),
    [handlePressMore, handlePressPost],
  );

  const isMyPost = selectedPost?.authorName === user?.name;

  if (isLoading) return <LoadingScreen message="게시글을 불러오는 중..." />;

  return (
    <View style={styles.container}>
      <BannerAdComponent />
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "GENERAL" && styles.activeTab]}
          onPress={() => handleTabChange("GENERAL")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "GENERAL" && styles.activeTabText,
            ]}
          >
            일반 게시글
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "COURSE" && styles.activeTab]}
          onPress={() => handleTabChange("COURSE")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "COURSE" && styles.activeTabText,
            ]}
          >
            러닝 코스
          </Text>
        </Pressable>
      </View>

      <View style={styles.filterContainer}>
        <Input
          placeholder="검색어를 입력해주세요."
          variant="neutral"
          startIcon={<SearchIcon />}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          wrapperStyle={{ marginBottom: spacing.md }}
        />
        <View style={styles.sortContainer}>
          <Pressable onPress={() => setActiveSort("LATEST")}>
            <Text
              style={[
                styles.sortText,
                activeSort === "LATEST" && styles.activeSortText,
              ]}
            >
              최신순
            </Text>
          </Pressable>
          <Pressable onPress={() => setActiveSort("POPULAR")}>
            <Text
              style={[
                styles.sortText,
                activeSort === "POPULAR" && styles.activeSortText,
              ]}
            >
              인기순
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.main} />
            </View>
          ) : null
        }
        initialNumToRender={5}
        windowSize={5}
        maxToRenderPerBatch={5}
      />

      <Button
        variant="primary"
        iconOnly
        rounded
        size="xl"
        wrapperStyle={styles.fab}
        onPress={() => {
          // [Analytics] 글쓰기 플로팅 버튼 클릭 트래픽 기록
          AnalyticsHelper.logEvent("community_write_clicked", {
            tab: activeTab,
          });

          router.push("/post-create");
        }}
      >
        <EditIcon />
      </Button>

      <Modal visible={isMenuVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {isMyPost ? (
              <>
                <Button
                  variant="text"
                  fullWidth
                  textStyle={styles.menuText}
                  wrapperStyle={styles.menuItem}
                  onPress={() => {
                    if (!selectedPost) return;

                    setMenuVisible(false);
                    router.push({
                      pathname: "post-create",
                      params: { postId: selectedPost.postId },
                    });
                  }}
                >
                  게시글 수정
                </Button>
                <Button
                  variant="text"
                  fullWidth
                  textStyle={styles.menuTextRed}
                  wrapperStyle={styles.menuItem}
                  onPress={handleDeletePost}
                >
                  게시글 삭제
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  fullWidth
                  textStyle={styles.menuTextRed}
                  wrapperStyle={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    setReportVisible(true);
                  }}
                >
                  신고하기
                </Button>
                {activeTab === "COURSE" && (
                  <Button
                    variant="text"
                    fullWidth
                    textStyle={styles.menuText}
                    wrapperStyle={styles.menuItem}
                    onPress={() => setMenuVisible(false)}
                  >
                    러닝 코스 저장
                  </Button>
                )}
                <Button
                  variant="text"
                  fullWidth
                  textStyle={styles.menuText}
                  wrapperStyle={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    toggleScrapMutation.mutate();
                  }}
                >
                  관심 게시물로 저장
                </Button>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      <ReportModal
        visible={isReportVisible}
        targetName={selectedPost?.authorName}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReportSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSecondary },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.base,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: colors.main },
  tabText: {
    fontSize: fontSizes.base,
    color: colors.gray500,
    fontWeight: fontWeights.medium,
  },
  activeTabText: { color: colors.main, fontWeight: fontWeights.bold },
  filterContainer: {
    backgroundColor: colors.bg,
    padding: spacing.base,
    paddingBottom: 0,
  },
  sortContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sortText: { fontSize: fontSizes.sm, color: colors.gray400 },
  activeSortText: {
    color: colors.main,
    fontWeight: fontWeights.bold,
    textDecorationLine: "underline",
  },
  listContent: { paddingBottom: 100 },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: 250,
    backgroundColor: colors.bg,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: 17,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  menuText: {
    fontSize: fontSizes.base,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  menuTextRed: {
    fontSize: fontSizes.base,
    color: colors.error,
    fontWeight: fontWeights.medium,
  },
  dummyIcon: {
    width: 20,
    height: 20,
    backgroundColor: colors.gray400,
    borderRadius: 10,
  },
  dummyIconWhite: {
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
});
