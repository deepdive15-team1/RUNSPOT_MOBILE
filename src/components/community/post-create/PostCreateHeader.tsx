import { Pressable, Text, View } from "react-native";

import BackIcon from "@/src/assets/icon/back.svg";
import { Button } from "@/src/components/common/button/Button";
import { styles } from "@/src/components/community/styles/PostCreate.styles";

interface PostCreateHeaderProps {
  isEditMode: boolean;
  hasInput: boolean;
  draftCount: number;
  isSavingDraft: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onLoadDrafts: () => void;
}

export function PostCreateHeader({
  isEditMode,
  hasInput,
  draftCount,
  isSavingDraft,
  onBack,
  onSaveDraft,
  onLoadDrafts,
}: PostCreateHeaderProps) {
  const showDraftList = !isEditMode && !hasInput && draftCount > 0;
  const showSaveDraft = !isEditMode && !showDraftList;

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Button
          variant="text"
          iconOnly
          startIcon={<BackIcon width={17} height={17} />}
          onPress={onBack}
        />
      </View>
      <Text style={styles.headerTitle}>
        게시글 {isEditMode ? "수정" : "작성"}
      </Text>
      <View style={styles.headerRight}>
        {showDraftList && (
          <Pressable onPress={onLoadDrafts} hitSlop={10}>
            <Text style={styles.draftText}>불러오기 ({draftCount})</Text>
          </Pressable>
        )}
        {showSaveDraft && (
          <Pressable
            onPress={onSaveDraft}
            hitSlop={10}
            disabled={isSavingDraft}
          >
            <Text style={styles.draftText}>임시저장</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
