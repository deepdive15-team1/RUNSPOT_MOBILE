import React from "react";
import { View, Text, StyleSheet, Pressable, Image, Share } from "react-native";

import { Button } from "../common/button/Button";

import MenuIcon from "@/src/assets/icon/chat/menu.svg";
import AavtarIcon from "@/src/assets/icon/common/avatar.svg";
import CommentIcon from "@/src/assets/icon/community/comment.svg";
import HeartIcon from "@/src/assets/icon/community/heart.svg";
import ShareIcon from "@/src/assets/icon/community/share.svg";
import LocationIcon from "@/src/assets/icon/session-detail/location.svg";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";
import { PostSummaryResponse } from "@/src/types/api/community";
import { AnalyticsHelper } from "@/src/utils/analytics";

export type FeedPost = PostSummaryResponse & {
  _mockRouteData?: {
    distance: number;
    routePolyline: { latitude: number; longitude: number }[];
    name?: string;
  };
};

interface PostCardProps {
  post: FeedPost;
  onPressMore: (post: FeedPost) => void;
  onPressPost: (postId: string) => void;
}

const PostCard = React.memo(
  ({ post, onPressMore, onPressPost }: PostCardProps) => {
    const handleShare = async () => {
      try {
        // [Analytics] 피드 카드 공유 클릭 트래픽 기록
        AnalyticsHelper.logEvent("post_card_shared", { postId: post.postId });
        const shareUrl =
          process.env.EXPO_PUBLIC_SHARE_URL ||
          "https://landing-lilac-zeta.vercel.app";
        await Share.share({
          message: `[RunSpot] ${post.author.name} 님의 게시글\n ${shareUrl}`,
        });
      } catch (error) {
        console.error("공유하기 에러:", error);
      }
    };

    return (
      <Pressable
        style={styles.card}
        onPress={() => onPressPost(post.postId.toString())}
      >
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <AavtarIcon color={colors.gray400} style={styles.avatar} />
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.createdAt}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Button
            variant="text"
            iconOnly
            size="sm"
            onPress={() => onPressMore(post)}
          >
            <MenuIcon width={24} height={24} />
          </Button>
        </View>

        {post.boardType === "GENERAL" && post.imageKeys?.length > 0 && (
          <Image
            source={{ uri: post.imageKeys[0] }}
            style={styles.media}
            resizeMode="cover"
          />
        )}
        {post.boardType === "COURSE" && post._mockRouteData && (
          <View style={styles.mapContainer} pointerEvents="none">
            <NaverMapComponent
              camera={{
                latitude:
                  post._mockRouteData.routePolyline[0]?.latitude || 37.5665,
                longitude:
                  post._mockRouteData.routePolyline[0]?.longitude || 126.978,
                zoom: 13,
              }}
              routePath={post._mockRouteData.routePolyline}
              isScrollGesturesEnabled={false}
              isZoomGesturesEnabled={false}
            />
          </View>
        )}

        {post.boardType === "COURSE" && post._mockRouteData && (
          <View style={styles.courseInfo}>
            <LocationIcon width={24} height={24} color={colors.main} />
            <Text style={styles.courseName}>
              {`${post._mockRouteData.name || "러닝 코스"} - ${post._mockRouteData.distance}km`}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <View style={styles.actionLeft}>
            <Button
              variant="text"
              size="sm"
              startIcon={
                <HeartIcon width={24} height={24} color={colors.black} />
              }
              textStyle={styles.actionText}
              wrapperStyle={styles.actionButtonZeroPad}
              onPress={() => onPressPost(post.postId.toString())}
            >
              {post.likeCount}
            </Button>
            <Button
              variant="text"
              size="sm"
              startIcon={<CommentIcon width={24} height={24} />}
              textStyle={styles.actionText}
              wrapperStyle={styles.actionButtonZeroPad}
              onPress={() => onPressPost(post.postId.toString())}
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

        <View style={styles.contentContainer}>
          <Text style={styles.likes}>좋아요 {post.likeCount}개</Text>
          <Text style={styles.content} numberOfLines={2}>
            <Text style={styles.authorNameBold}>{post.author.name} </Text>
            {post.content}
          </Text>
          <Text style={styles.hashtags}>{post.tags.join(" ")}</Text>

          <Button
            variant="text"
            fullWidth
            textStyle={styles.commentsPreview}
            wrapperStyle={{
              paddingVertical: spacing.xs,
              alignItems: "flex-start",
            }}
            onPress={() => onPressPost(post.postId.toString())}
          >
            댓글 {post.commentCount}개 모두 보기
          </Button>
        </View>
      </Pressable>
    );
  },
);

PostCard.displayName = "PostCard";
export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    marginBottom: spacing.md,
    paddingBottom: spacing.base,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
  },
  authorInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: colors.gray200,
  },
  authorName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  authorNameBold: { fontWeight: fontWeights.bold },
  createdAt: { fontSize: fontSizes.xs, color: colors.gray500 },
  media: { width: "100%", height: 300, backgroundColor: colors.gray100 },
  mapContainer: { width: "100%", height: 250 },
  courseInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    backgroundColor: colors.gray100,
    gap: spacing.xs,
  },
  courseName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  actionLeft: { flexDirection: "row", gap: spacing.md },
  actionButtonZeroPad: { paddingHorizontal: 0, paddingVertical: 0 },
  actionText: {
    fontSize: fontSizes.sm,
    color: colors.gray500,
    fontWeight: fontWeights.medium,
  },
  contentContainer: { paddingHorizontal: spacing.base, gap: spacing.xs },
  likes: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  content: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 20 },
  hashtags: { fontSize: fontSizes.sm, color: colors.main },
  commentsPreview: { fontSize: fontSizes.sm, color: colors.gray500 },
});
