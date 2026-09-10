import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { Button } from "../common/button/Button";

import type { CommentResponse } from "@/src/api/community/communityApi.mock";
import AvatarIcon from "@/src/assets/icon/common/avatar.svg";
import ReplyIcon from "@/src/assets/icon/community/reply.svg";
import { colors, fontSizes, fontWeights, spacing } from "@/src/constants";

interface CommentItemProps {
  comment: CommentResponse;
  isReply?: boolean;
  onPressReply?: (commentId: number, authorName: string) => void;
  onPressDelete?: (commentId: number) => void;
}

const CommentItem = React.memo(
  ({
    comment,
    isReply = false,
    onPressReply,
    onPressDelete,
  }: CommentItemProps) => {
    const formattedDate = new Date(comment.createdAt).toLocaleDateString();

    const renderRightActions = () => {
      return (
        <Button
          variant="text"
          wrapperStyle={styles.deleteSwipeButton}
          textStyle={styles.deleteSwipeText}
          onPress={() => onPressDelete?.(comment.commentId)}
        >
          삭제
        </Button>
      );
    };

    return (
      <Swipeable
        renderRightActions={comment.mine ? renderRightActions : undefined}
        overshootRight={false}
      >
        <View style={[styles.container, isReply && styles.replyContainer]}>
          {isReply && <ReplyIcon style={styles.replyIcon} />}

          <AvatarIcon color={colors.gray300} style={styles.avatar} />

          <View style={styles.contentWrap}>
            <View style={styles.header}>
              <Text style={styles.authorName}>{comment.authorName}</Text>
              {comment.mine && (
                <View style={styles.authorBadge}>
                  <Text style={styles.authorBadgeText}>작성자</Text>
                </View>
              )}
              <Text style={styles.createdAt}>{formattedDate}</Text>
            </View>

            <Text style={styles.content}>{comment.content}</Text>

            {!isReply && onPressReply && (
              <Button
                variant="text"
                size="xs"
                textStyle={styles.replyButton}
                wrapperStyle={styles.replyButtonWrap}
                onPress={() =>
                  onPressReply(comment.commentId, comment.authorName)
                }
              >
                답글 달기
              </Button>
            )}
          </View>
        </View>
      </Swipeable>
    );
  },
);

CommentItem.displayName = "CommentItem";
export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.bg,
  },
  replyContainer: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.base,
    backgroundColor: colors.gray100,
  },
  replyIcon: { marginRight: spacing.sm, marginTop: 4 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray200,
    marginRight: spacing.sm,
  },
  contentWrap: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  authorName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginRight: spacing.xs,
  },
  authorBadge: {
    backgroundColor: colors.mainLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  authorBadgeText: {
    fontSize: 10,
    color: colors.main,
    fontWeight: fontWeights.bold,
  },
  createdAt: { fontSize: fontSizes.xs, color: colors.gray400 },
  content: {
    fontSize: fontSizes.sm,
    color: colors.gray800,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  replyButtonWrap: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginTop: spacing.xs,
  },
  replyButton: {
    fontSize: fontSizes.xs,
    color: colors.gray500,
    fontWeight: fontWeights.medium,
  },
  deleteSwipeButton: {
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 0,
  },
  deleteSwipeText: {
    color: colors.white,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },
});
