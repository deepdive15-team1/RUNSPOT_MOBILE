import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { styles } from "@/src/components/community/styles/PostCreate.styles";
import { colors } from "@/src/constants";
import type { PostDetailResponse } from "@/src/types/api/community";
import { formatDate } from "@/src/utils/date";

interface PostDraftModalProps {
  visible: boolean;
  drafts?: PostDetailResponse[];
  onClose: () => void;
  onSelect: (draft: PostDetailResponse) => void;
}

export function PostDraftModal({
  visible,
  drafts,
  onClose,
  onSelect,
}: PostDraftModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.draftModalOverlay}>
        <View style={styles.draftModalContainer}>
          <View style={styles.draftModalHeader}>
            <Text style={styles.draftModalTitle}>임시저장 목록</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <FlatList
            data={drafts}
            keyExtractor={(item) => String(item.postId)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.draftItem}
                onPress={() => onSelect(item)}
              >
                <View style={styles.draftItemTextWrap}>
                  <Text style={styles.draftItemType}>
                    {item.boardType === "COURSE" ? "[코스]" : "[일반]"}
                  </Text>
                  <Text style={styles.draftItemTitle} numberOfLines={1}>
                    {item.title || "제목 없음"}
                  </Text>
                </View>
                <Text style={styles.draftItemDate}>
                  {formatDate(item.updatedAt)}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.draftEmptyText}>
                임시저장된 게시글이 없습니다.
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}
