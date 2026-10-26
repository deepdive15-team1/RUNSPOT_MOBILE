import { useCallback } from "react";
import { View } from "react-native";

import { Input } from "@/src/components/common/Input/Input";
import Chip from "@/src/components/common/chip";
import { TextField } from "@/src/components/common/textfield";
import { styles } from "@/src/components/community/styles/PostCreate.styles";
import type { BoardType } from "@/src/types/api/community";

interface PostTextFieldsProps {
  boardType: BoardType;
  title: string;
  content: string;
  tags: string[];
  tagInput: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagInputChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
}

export function PostTextFields({
  boardType,
  title,
  content,
  tags,
  tagInput,
  onTitleChange,
  onContentChange,
  onTagInputChange,
  onTagsChange,
}: PostTextFieldsProps) {
  const handleTagInput = useCallback(
    (value: string) => {
      if (!value.includes(" ")) {
        onTagInputChange(value);
        return;
      }

      const newTag = value.replace(/#/g, "").trim();
      if (newTag && tags.length < 10 && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      onTagInputChange("");
    },
    [onTagInputChange, onTagsChange, tags],
  );

  return (
    <>
      <View style={styles.section}>
        <Input
          label="제목"
          variant="underline"
          placeholder={
            boardType === "GENERAL"
              ? "게시글 제목을 입력하세요"
              : "코스 게시글 제목을 입력하세요"
          }
          value={title}
          onChangeText={onTitleChange}
          maxLength={100}
        />
      </View>
      <View style={styles.section}>
        <TextField
          label="내용"
          variant="primary"
          placeholder={
            boardType === "GENERAL"
              ? "공유하고 싶은 내용을 적어주세요"
              : "추천하는 러닝 코스에 대해 설명해주세요."
          }
          value={content}
          onChangeText={onContentChange}
          minRows={5}
        />
      </View>
      <View style={styles.section}>
        <Input
          label="테마 또는 태그 입력"
          variant="underline"
          placeholder="#러닝 (스페이스바로 등록)"
          value={tagInput}
          onChangeText={handleTagInput}
        />
        {tags.length > 0 && (
          <View style={styles.tagList}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                variant="outlined"
                color="secondary"
                onDelete={() =>
                  onTagsChange(
                    tags.filter((existingTag) => existingTag !== tag),
                  )
                }
              />
            ))}
          </View>
        )}
      </View>
    </>
  );
}
