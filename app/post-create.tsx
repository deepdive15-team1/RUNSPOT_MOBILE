import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createPost,
  editPost,
  saveDraftPost,
  uploadImage,
} from "@/src/api/community/communityApi.mock";
import { getSessionDetail } from "@/src/api/session-detail/sessionDetailApi.index";
import BackIcon from "@/src/assets/icon/back.svg";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/button/Button";
import Chip from "@/src/components/common/chip";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { TextField } from "@/src/components/common/textfield";
import { styles } from "@/src/components/community/styles/PostCreate.styles";
import LoadCourseModal from "@/src/components/create-session/LoadCourseModal";
import { colors } from "@/src/constants";
import { BoardType, PostUpsertRequest } from "@/src/types/api/community";
import { PastCourse } from "@/src/types/domain/course";
import { secondsToPaceString } from "@/src/utils";
import { AnalyticsHelper } from "@/src/utils/analytics";
import { formatDate } from "@/src/utils/date";

export default function PostCreateScreen() {
  const router = useRouter();

  const { postId } = useLocalSearchParams<{ postId: string }>();
  const isEditMode = !!postId;

  const [boardType, setBoardType] = useState<BoardType>("GENERAL");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<PastCourse | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isCourseModalVisible, setCourseModalVisible] = useState(false);

  const { data: courseDetail, isLoading: isCourseDetailLoading } = useQuery({
    queryKey: ["courseDetail", selectedCourse?.id],
    queryFn: () => getSessionDetail(selectedCourse!.id),
    enabled: !!selectedCourse?.id,
  });

  const mappedRoutePath = useMemo(() => {
    if (!courseDetail) return [];
    return courseDetail.routePolyline.map((point) => ({
      latitude: point.y,
      longitude: point.x,
    }));
  }, [courseDetail]);

  const createPostMutation = useMutation({
    // TODO[API]: 게시글 작성 API 연동
    mutationFn: createPost,
    onSuccess: (_data) => {
      // [Analytics] 게시글 작성 완료 트래픽 기록
      AnalyticsHelper.logEvent("post_created", {
        boardType,
        hasCourse: !!selectedCourse,
      });
      Alert.alert("성공", "게시글이 작성되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    },
    onError: () => {
      Alert.alert("오류", "게시글 작성에 실패했습니다.");
    },
  });

  const editPostMutation = useMutation({
    mutationFn: (payload: PostUpsertRequest) =>
      editPost({ postId: Number(postId), payload }),
    onSuccess: () => {
      // [Analytics] 게시글 수정 트래픽 기록
      AnalyticsHelper.logEvent("post_edited", {
        boardType,
        hasCourse: !!selectedCourse,
      });
      Alert.alert("성공", "게시글이 수정되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    },
    onError: () => {
      Alert.alert("오류", "게시글 수정에 실패했습니다.");
    },
  });

  const saveDraftMutation = useMutation({
    // TODO[API]: 게시글 임시저장 API 연동
    mutationFn: saveDraftPost,
    onSuccess: () => {
      // [Analytics] 게시글 임시저장 트래픽 기록
      AnalyticsHelper.logEvent("post_draft_saved", { boardType });
      Alert.alert("임시저장", "게시글이 임시저장 되었습니다.");
    },
  });

  const handleTabChange = useCallback((type: BoardType) => {
    // [Analytics] 작성 탭 변경 트래픽 기록
    AnalyticsHelper.logEvent("create_post_tab_changed", { to: type });
    setBoardType(type);
  }, []);

  const handleAddImage = async () => {
    if (images.length >= 3) {
      Alert.alert("알림", "사진은 최대 3장까지만 첨부 가능합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImageUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImageUris].slice(0, 3));
    }
  };

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTagInput = (text: string) => {
    if (text.includes(" ")) {
      const newTag = text.replace(/#/g, "").trim();
      if (newTag && tags.length < 10 && !tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    } else {
      setTagInput(text);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const isLocalImage = (uri: string) => {
    return uri.startsWith("file://") || uri.startsWith("content://");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert("알림", "제목을 입력해주세요.");
    if (!content.trim()) return Alert.alert("알림", "내용을 입력해주세요.");
    if (boardType === "COURSE" && !selectedCourse) {
      return Alert.alert("알림", "러닝 코스를 첨부해주세요.");
    }

    setIsUploading(true);

    try {
      const uploadedImageKeys = await Promise.all(
        images.map(async (imgUri) => {
          if (isLocalImage(imgUri)) {
            return await uploadImage(imgUri);
          } else {
            return imgUri;
          }
        }),
      );

      const payload: PostUpsertRequest = {
        boardType,
        title,
        content,
        imageKeys: uploadedImageKeys,
        tags: tags,
        runningRecordId: boardType === "COURSE" ? selectedCourse?.id : null,
        status: "PUBLISHED",
      };

      if (isEditMode) {
        editPostMutation.mutate(payload);
      } else {
        createPostMutation.mutate(payload);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = () => {
    const payload: PostUpsertRequest = {
      boardType,
      title,
      content,
      imageKeys: images,
      tags: tags,
      runningRecordId: boardType === "COURSE" ? selectedCourse?.id : null,
      status: "DRAFT",
    };
    saveDraftMutation.mutate(payload);
  };

  const renderImageSection = () => (
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
        {images.map((imgUri, idx) => (
          <View key={imgUri + idx} style={styles.imagePreviewBox}>
            <Image source={{ uri: imgUri }} style={styles.imagePlaceholder} />
            <Pressable
              style={styles.deleteIcon}
              onPress={() => handleRemoveImage(idx)}
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={20} color={colors.gray700} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderTitleSection = () => (
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
        onChangeText={setTitle}
        maxLength={100}
      />
    </View>
  );

  const renderContentSection = () => (
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
        onChangeText={setContent}
        minRows={5}
      />
    </View>
  );

  const renderCourseSection = () => {
    if (boardType !== "COURSE") return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>러닝 코스</Text>
        {!selectedCourse ? (
          <Pressable
            style={styles.addCourseButton}
            onPress={() => setCourseModalVisible(true)}
          >
            <MaterialIcons name="add" size={20} color={colors.main} />
            <Text style={styles.addCourseText}>러닝 코스 불러오기</Text>
          </Pressable>
        ) : (
          <View style={styles.courseCard}>
            <View style={styles.courseCardHeader}>
              <View>
                <Text style={styles.courseTitle}>{selectedCourse.title}</Text>
                <Text style={styles.courseDate}>
                  {formatDate(selectedCourse.createdAt)}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedCourse(null)} hitSlop={10}>
                <Ionicons name="close" size={20} color={colors.gray500} />
              </Pressable>
            </View>

            <View style={styles.courseStatRow}>
              <View style={styles.courseStatBox}>
                <Text style={styles.courseStatLabel}>총 거리</Text>
                <Text style={styles.courseStatValue}>
                  {selectedCourse.targetDistanceKm}km
                </Text>
              </View>
              <View style={styles.courseStatDivider} />
              <View style={styles.courseStatBox}>
                <Text style={styles.courseStatLabel}>평균 페이스</Text>
                <Text style={styles.courseStatValue}>
                  {secondsToPaceString(selectedCourse.avgPaceSec)}/km
                </Text>
              </View>
            </View>

            <View style={styles.courseMapPlaceholder}>
              {isCourseDetailLoading ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : mappedRoutePath.length > 0 ? (
                <View style={StyleSheet.absoluteFillObject}>
                  <NaverMapComponent
                    camera={{
                      latitude: mappedRoutePath[0].latitude,
                      longitude: mappedRoutePath[0].longitude,
                      zoom: 14,
                    }}
                    routePath={mappedRoutePath}
                    isScrollGesturesEnabled={false}
                    isZoomGesturesEnabled={false}
                    showLocationButton={false}
                    isShowZoomControls={false}
                  />
                </View>
              ) : (
                <>
                  <Ionicons
                    name="map-outline"
                    size={32}
                    color={colors.gray400}
                  />
                  <Text style={styles.courseMapText}>
                    경로 데이터를 불러올 수 없습니다.
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTagSection = () => (
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
          {tags.map((tag, idx) => (
            <Chip
              key={idx}
              label={`#${tag}`}
              variant="outlined"
              color="secondary"
              onDelete={() => handleRemoveTag(tag)}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button
            variant="text"
            iconOnly
            startIcon={<BackIcon width={17} height={17} />}
            onPress={() => router.back()}
          />
        </View>
        <Text style={styles.headerTitle}>게시글 작성</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={handleSaveDraft}>
            <Text style={styles.draftText}>임시저장</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, boardType === "GENERAL" && styles.activeTab]}
          onPress={() => handleTabChange("GENERAL")}
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
          onPress={() => handleTabChange("COURSE")}
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollInner}
        >
          {boardType === "GENERAL" ? (
            <>
              {renderImageSection()}
              {renderTitleSection()}
              {renderContentSection()}
              {renderTagSection()}
            </>
          ) : (
            <>
              {renderTitleSection()}
              {renderContentSection()}
              {renderCourseSection()}
              {renderImageSection()}
              {renderTagSection()}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomFixed}>
        <Button
          variant="primary"
          fullWidth
          disabled={
            createPostMutation.isPending ||
            editPostMutation.isPending ||
            isUploading
          }
          onPress={handleSubmit}
        >
          {isUploading
            ? "사진 업로드 중..."
            : createPostMutation.isPending || editPostMutation.isPending
              ? "처리 중..."
              : isEditMode
                ? "수정 완료"
                : "작성 완료"}
        </Button>
      </View>

      <LoadCourseModal
        visible={isCourseModalVisible}
        onClose={() => setCourseModalVisible(false)}
        onSelect={(course) => {
          setSelectedCourse(course);
          // [Analytics] 코스 불러오기 트래픽 기록
          AnalyticsHelper.logEvent("course_attached", { courseId: course.id });
        }}
      />
    </SafeAreaView>
  );
}
