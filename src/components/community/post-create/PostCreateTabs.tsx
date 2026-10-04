import { Pressable, Text, View } from "react-native";

import { styles } from "@/src/components/community/styles/PostCreate.styles";
import type { BoardType } from "@/src/types/api/community";

interface PostCreateTabsProps {
  boardType: BoardType;
  onChange: (boardType: BoardType) => void;
}

export function PostCreateTabs({ boardType, onChange }: PostCreateTabsProps) {
  return (
    <View style={styles.tabContainer}>
      <Pressable
        style={[styles.tab, boardType === "GENERAL" && styles.activeTab]}
        onPress={() => onChange("GENERAL")}
      >
        <Text
          style={[
            styles.tabText,
            boardType === "GENERAL" && styles.activeTabText,
          ]}
        >
          일반 게시글
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, boardType === "COURSE" && styles.activeTab]}
        onPress={() => onChange("COURSE")}
      >
        <Text
          style={[
            styles.tabText,
            boardType === "COURSE" && styles.activeTabText,
          ]}
        >
          러닝 코스
        </Text>
      </Pressable>
    </View>
  );
}
