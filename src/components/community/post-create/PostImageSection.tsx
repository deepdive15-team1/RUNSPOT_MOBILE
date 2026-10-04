import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

import { styles } from "@/src/components/community/styles/PostCreate.styles";
import { colors } from "@/src/constants";
import { getImageUrl } from "@/src/utils/getImageUrl";

interface PostImageSectionProps {
  images: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
}

export function PostImageSection({ images, onChange }: PostImageSectionProps) {
  const handleAddImage = useCallback(async () => {
    if (images.length >= 3) {
      Alert.alert("알림", "사진은 최대 3장까지 첨부 가능합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      onChange((currentImages) =>
        [...currentImages, ...selectedUris].slice(0, 3),
      );
    }
  }, [images, onChange]);

  const handleRemoveImage = useCallback(
    (index: number) =>
      onChange((currentImages) =>
        currentImages.filter((_, imageIndex) => imageIndex !== index),
      ),
    [onChange],
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>사진 첨부</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imageScroll}
      >
        <Pressable style={styles.cameraBox} onPress={handleAddImage}>
          <Ionicons name="camera-outline" size={24} color={colors.gray400} />
          <Text style={styles.cameraText}>{images.length}/3</Text>
        </Pressable>
        {images.map((imageUri, index) => (
          <View key={`${imageUri}-${index}`} style={styles.imagePreviewBox}>
            <Image
              source={{ uri: getImageUrl(imageUri) }}
              style={styles.imagePlaceholder}
            />
            <Pressable
              style={styles.deleteIcon}
              onPress={() => handleRemoveImage(index)}
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={20} color={colors.gray700} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
