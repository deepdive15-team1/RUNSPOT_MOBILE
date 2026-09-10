import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  Dimensions,
  Share,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getPostDetail,
  getComments,
} from "@/src/api/community/communityApi.mock";
import BackIcon from "@/src/assets/icon/back.svg";
import AavtarIcon from "@/src/assets/icon/common/avatar.svg";
import AllowSendIcon from "@/src/assets/icon/community/arrow-up.svg";
import CommentIcon from "@/src/assets/icon/community/comment.svg";
import HeartIcon from "@/src/assets/icon/community/heart.svg";
import MenuIcon from "@/src/assets/icon/community/menu.svg";
import ShareIcon from "@/src/assets/icon/community/share.svg";
import LocationIcon from "@/src/assets/icon/session-detail/location.svg";
import { BannerAdComponent } from "@/src/components/common/admob/BannerAdComponent";
import { Button } from "@/src/components/common/button/Button";
import { LoadingScreen } from "@/src/components/common/loading/LoadingScreen";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { ReportModal } from "@/src/components/common/modal/ReportModal";
import CommentItem from "@/src/components/community/CommentItem";
import { styles } from "@/src/components/community/styles/PostDetail.styles";
import { colors, spacing } from "@/src/constants";
import { useToggleLike } from "@/src/hooks/community/useToggleLike";
import { CommentResponse } from "@/src/types/api/community";
import { AnalyticsHelper } from "@/src/utils/analytics";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface TreeComment extends CommentResponse {
  replies: TreeComment[];
}

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const { mutate: toggleLike } = useToggleLike(Number(postId));

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isReportVisible, setReportVisible] = useState(false);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: post, isLoading: isPostLoading } = useQuery({
    queryKey: ["postDetail", postId],
    queryFn: () => getPostDetail(Number(postId)),
  });

  const { data: commentsFlat, isLoading: isCommentLoading } = useQuery<
    CommentResponse[]
  >({
    queryKey: ["comments", postId],
    queryFn: () => getComments(Number(postId)),
  });

  const handleDeleteComment = useCallback((commentId: number) => {
    Alert.alert("댓글 삭제", "댓글을 완전히 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          // [Analytics] 댓글 삭제 트래픽 기록
          AnalyticsHelper.logEvent("comment_deleted", { commentId });
          // TODO[API]: 댓글 삭제 API 연동 및 캐시 무효화
        },
      },
    ]);
  }, []);

  const commentTree = useMemo<TreeComment[]>(() => {
    if (!commentsFlat) return [];
    const activeComments = commentsFlat.filter((c) => c.status !== "DELETED");
    const map = new Map<number, TreeComment>();
    const tree: TreeComment[] = [];

    activeComments.forEach((c) => {
      map.set(c.commentId, { ...c, replies: [] });
    });
    activeComments.forEach((c) => {
      if (c.parentId !== null) {
        map.get(c.parentId)?.replies.push(map.get(c.commentId)!);
      } else {
        const rootComment = map.get(c.commentId);
        if (rootComment) tree.push(rootComment);
      }
    });

    return tree;
  }, [commentsFlat]);

  const previewComments = commentTree.slice(0, 2);
  const isMyPost = !!post?.mine;

  const handleEditPost = useCallback(() => {
    setMenuVisible(false);
    // TODO[API]: 수정 화면으로 데이터 전달 및 이동
  }, []);

  const handleDeletePost = useCallback(() => {
    setMenuVisible(false);
    Alert.alert("게시글 삭제", "정말로 이 게시글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          // [Analytics] 게시글 삭제 트래픽 기록
          AnalyticsHelper.logEvent("post_deleted", { postId });
          // TODO[API]: 게시글 삭제 API 연동
          router.back();
        },
      },
    ]);
  }, [postId, router]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      setCurrentImageIndex(
        Math.round(event.nativeEvent.contentOffset.x / slideSize),
      );
    },
    [],
  );

  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim()) return;
    // [Analytics] 댓글/대댓글 작성 트래픽 기록
    AnalyticsHelper.logEvent("comment_submitted", {
      postId,
      isReply: !!replyTarget,
    });

    // TODO[API]: 댓글 작성 API 연동
    setCommentText("");
    setReplyTarget(null);
  }, [commentText, postId, replyTarget]);

  const handleShare = useCallback(async () => {
    try {
      // [Analytics] 게시글 공유하기 클릭 트래픽 기록
      AnalyticsHelper.logEvent("post_shared", { postId });
      const shareUrl =
        process.env.EXPO_PUBLIC_SHARE_URL ||
        "https://landing-lilac-zeta.vercel.app";
      await Share.share({
        message: `[RunSpot] ${post?.title}\n ${shareUrl}`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("게시물 공유에 실패하였습니다.");
      }
    }
  }, [postId, post]);

  const handlePressReply = useCallback((id: number, name: string) => {
    setReplyTarget({ id: String(id), name });
  }, []);

  const renderComment = useCallback(
    ({ item }: { item: TreeComment }) => (
      <View>
        <CommentItem
          comment={item}
          onPressReply={handlePressReply}
          onPressDelete={handleDeleteComment}
        />
        {item.replies.map((reply: TreeComment) => (
          <CommentItem
            key={reply.commentId}
            comment={reply}
            isReply
            onPressDelete={handleDeleteComment}
          />
        ))}
      </View>
    ),
    [handlePressReply, handleDeleteComment],
  );

  const renderPostContent = () => {
    if (!post) return null;
    return (
      <SafeAreaView style={styles.headerContainer} edges={["top"]}>
        {post.boardType === "GENERAL" &&
        post.imageKeys &&
        post.imageKeys.length > 0 ? (
          <View>
            <FlatList
              data={post.imageKeys}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              keyExtractor={(url) => url}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={[styles.media, { width: SCREEN_WIDTH }]}
                  resizeMode="cover"
                />
              )}
            />
            {post.imageKeys.length > 1 && (
              <View style={styles.pageBadge}>
                <Text style={styles.pageBadgeText}>
                  {currentImageIndex + 1}/{post.imageKeys.length}
                </Text>
              </View>
            )}
          </View>
        ) : post.boardType === "COURSE" && post._mockRouteData ? (
          <View>
            <View style={styles.mapContainer} pointerEvents="auto">
              <NaverMapComponent
                camera={{
                  latitude:
                    post._mockRouteData.routePolyline[0]?.latitude || 37.5665,
                  longitude:
                    post._mockRouteData.routePolyline[0]?.longitude || 126.978,
                  zoom: 14,
                }}
                routePath={post._mockRouteData.routePolyline}
                markers={post._mockRouteData.markers}
                isScrollGesturesEnabled={true}
                isZoomGesturesEnabled={true}
              />
            </View>
            <View style={styles.courseInfoBar}>
              <LocationIcon width={24} height={24} color={colors.main} />
              <View style={{ flex: 1, marginLeft: spacing.xs }}>
                <Text style={styles.courseInfoText}>
                  {post.title} - {post._mockRouteData.distance}km
                </Text>
                <Text
                  style={{ fontSize: 10, color: colors.gray500, marginTop: 2 }}
                >
                  지도를 움직이거나 핀을 눌러 상세 정보를 확인하세요.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.postInfo}>
          <View style={styles.authorRow}>
            <AavtarIcon style={styles.avatar} />
            <View>
              <Text style={styles.authorName}>
                {post.author?.name || "사용자"}
              </Text>
              <Text style={styles.createdAt}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Text style={styles.content}>{post.content}</Text>
          <Text style={styles.hashtags}>{post.tags.join(" ")}</Text>

          <View style={styles.actions}>
            <View style={styles.actionLeft}>
              <Button
                variant="text"
                size="sm"
                startIcon={
                  <HeartIcon
                    width={24}
                    height={24}
                    color={post.liked ? colors.red : colors.black}
                    fill={post.liked ? colors.red : "none"}
                  />
                }
                textStyle={styles.actionText}
                wrapperStyle={styles.actionButtonZeroPad}
                onPress={() => toggleLike()}
              >
                {post.likeCount}
              </Button>
              <Button
                variant="text"
                size="sm"
                startIcon={<CommentIcon width={24} height={24} />}
                textStyle={styles.actionText}
                wrapperStyle={styles.actionButtonZeroPad}
                onPress={() => setCommentModalVisible(true)}
              >
                {post.commentCount}
              </Button>
              <Button
                variant="text"
                iconOnly
                size="sm"
                wrapperStyle={styles.actionButtonZeroPad}
                onPress={handleShare}
              >
                <ShareIcon width={24} height={24} />
              </Button>
            </View>
          </View>
          <Text style={styles.likes}>좋아요 {post.likeCount}개</Text>
        </View>
        <View style={styles.divider} />
      </SafeAreaView>
    );
  };

  if (isPostLoading || isCommentLoading)
    return <LoadingScreen message="게시글을 불러오는 중..." />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.navBar}>
        <Button variant="text" iconOnly onPress={() => router.back()}>
          <BackIcon width={24} height={24} />
        </Button>
        <Button variant="text" iconOnly onPress={() => setMenuVisible(true)}>
          <MenuIcon width={24} height={24} />
        </Button>
      </View>
      <BannerAdComponent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderPostContent()}

        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>댓글</Text>
          {previewComments.map((item) => (
            <View key={item.commentId}>{renderComment({ item })}</View>
          ))}

          {commentTree.length > 2 && (
            <Button
              variant="text"
              fullWidth
              textStyle={styles.viewMoreText}
              onPress={() => setCommentModalVisible(true)}
            >
              댓글 {post?.commentCount}개 모두 보기
            </Button>
          )}
          {commentTree.length === 0 && (
            <Button
              variant="text"
              fullWidth
              textStyle={styles.viewMoreText}
              onPress={() => setCommentModalVisible(true)}
            >
              가장 먼저 댓글을 남겨보세요.
            </Button>
          )}
        </View>
      </ScrollView>

      <View style={styles.fakeInputContainer}>
        <Button
          variant="neutral"
          fullWidth
          textStyle={{ color: colors.gray400, textAlign: "left" }}
          wrapperStyle={styles.fakeInputButton}
          onPress={() => setCommentModalVisible(true)}
        >
          댓글을 남겨보세요
        </Button>
      </View>

      <Modal
        visible={isCommentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => setCommentModalVisible(false)}
            />

            <View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>댓글</Text>
                <Button
                  variant="text"
                  size="sm"
                  textStyle={styles.sheetClose}
                  onPress={() => setCommentModalVisible(false)}
                >
                  닫기
                </Button>
              </View>

              <FlatList
                data={commentTree}
                keyExtractor={(item) => item.commentId.toString()}
                renderItem={renderComment}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxl }}
              />

              <View style={styles.inputContainer}>
                {replyTarget && (
                  <View style={styles.replyTargetHeader}>
                    <Text style={styles.replyTargetText}>
                      {replyTarget.name}님에게 답글 남기는 중...
                    </Text>
                    <Button
                      variant="text"
                      size="xs"
                      textStyle={styles.replyCancel}
                      onPress={() => setReplyTarget(null)}
                    >
                      취소
                    </Button>
                  </View>
                )}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      replyTarget ? "답글을 달아주세요." : "댓글을 달아주세요."
                    }
                    placeholderTextColor={colors.gray400}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={300}
                    autoFocus
                  />
                  <Button
                    variant="primary"
                    iconOnly
                    rounded
                    size="sm"
                    wrapperStyle={styles.sendBtn}
                    onPress={handleSubmitComment}
                  >
                    <AllowSendIcon width={16} height={16} />
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isMenuVisible} transparent animationType="fade">
        <Pressable
          style={styles.menuOverlay}
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
                  onPress={handleEditPost}
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
                {post?.boardType === "COURSE" && (
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
                  onPress={() => setMenuVisible(false)}
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
        targetName={post?.author?.name}
        onClose={() => setReportVisible(false)}
        onSubmit={(reason) => {
          // [Analytics] 상세 게시글 신고 트래픽 기록
          AnalyticsHelper.logEvent("post_detail_reported", { postId, reason });
          setReportVisible(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
