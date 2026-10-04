import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CommunityApi } from "@/src/api/community/communityApi.index";
import { RunningRecordApi } from "@/src/api/runningCourse/runningRecordsApi.index";
import { Button } from "@/src/components/common/button/Button";
import { LoadingScreen } from "@/src/components/common/loading/LoadingScreen";
import { PostCourseSection } from "@/src/components/community/post-create/PostCourseSection";
import { PostCreateHeader } from "@/src/components/community/post-create/PostCreateHeader";
import { PostCreateTabs } from "@/src/components/community/post-create/PostCreateTabs";
import { PostDraftModal } from "@/src/components/community/post-create/PostDraftModal";
import { PostImageSection } from "@/src/components/community/post-create/PostImageSection";
import { PostTextFields } from "@/src/components/community/post-create/PostTextFields";
import { styles } from "@/src/components/community/styles/PostCreate.styles";
import LoadCourseModal from "@/src/components/create-session/LoadCourseModal";
import {
  BoardType,
  PostDetailResponse,
  PostUpsertRequest,
} from "@/src/types/api/community";
import type { RoutePoint } from "@/src/types/api/session-detail";
import { PastCourse } from "@/src/types/domain/course";
import { paceStringToSeconds } from "@/src/utils";
import { AnalyticsHelper } from "@/src/utils/analytics";

const parseRoutePolyline = (value: string): RoutePoint[] => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (point): point is RoutePoint =>
        point !== null &&
        typeof point === "object" &&
        "x" in point &&
        "y" in point &&
        typeof point.x === "number" &&
        Number.isFinite(point.x) &&
        typeof point.y === "number" &&
        Number.isFinite(point.y),
    );
  } catch {
    return [];
  }
};

export default function PostCreateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { postId } = useLocalSearchParams<{ postId: string }>();
  const isEditMode = !!postId;
  const numericPostId = Number(postId);
  const hasValidPostId =
    Number.isSafeInteger(numericPostId) && numericPostId > 0;

  const [boardType, setBoardType] = useState<BoardType>("GENERAL");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<PastCourse | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isCourseModalVisible, setCourseModalVisible] = useState(false);
  const [isDraftModalVisible, setDraftModalVisible] = useState(false);

  const {
    data: editPostData,
    isLoading: isEditDataLoading,
    isError: isEditDataError,
    refetch: refetchEditPost,
  } = useQuery({
    queryKey: ["postDetail", numericPostId],
    queryFn: () => CommunityApi.getPostDetail(numericPostId),
    enabled: isEditMode && hasValidPostId,
  });

  const { data: runningRecords, isLoading: isRunningRecordsLoading } = useQuery(
    {
      queryKey: ["myRunningRecords"],
      queryFn: RunningRecordApi.getMyRunningRecords,
      enabled:
        isEditMode &&
        !!editPostData &&
        editPostData.boardType === "COURSE" &&
        editPostData.runningRecordId !== null,
    },
  );

  const linkedRunningRecord = runningRecords?.find(
    (record) => record.runningRecordId === editPostData?.runningRecordId,
  );

  useEffect(() => {
    if (!isEditMode || !editPostData) return;

    setBoardType(editPostData.boardType);
    setTitle(editPostData.title);
    setContent(editPostData.content);
    setImages(editPostData.imageKeys || []);
    setTags(editPostData.tags || []);
  }, [isEditMode, editPostData]);

  useEffect(() => {
    if (
      !isEditMode ||
      !editPostData ||
      editPostData.boardType !== "COURSE" ||
      editPostData.runningRecordId === null ||
      isRunningRecordsLoading
    ) {
      return;
    }

    if (linkedRunningRecord) {
      setSelectedCourse({
        id: linkedRunningRecord.runningRecordId,
        title: linkedRunningRecord.title,
        createdAt: linkedRunningRecord.recordedAt,
        targetDistanceKm: linkedRunningRecord.distanceKm,
        avgPaceSec: paceStringToSeconds(linkedRunningRecord.avgPace) ?? 0,
        locationName: linkedRunningRecord.locationName,
        address: linkedRunningRecord.locationDetail,
        routePolyline: parseRoutePolyline(linkedRunningRecord.routePolyline),
        markers: [],
      });
      return;
    }

    setSelectedCourse({
      id: editPostData.runningRecordId,
      title: "연결된 코스",
      createdAt: editPostData.createdAt,
      targetDistanceKm: 0,
      avgPaceSec: 0,
      locationName: "",
      address: "",
      routePolyline: [],
      markers: [],
    });
  }, [isEditMode, editPostData, isRunningRecordsLoading, linkedRunningRecord]);

  const { data: draftPosts } = useQuery({
    queryKey: ["draftPosts"],
    queryFn: CommunityApi.getDraftPosts,
  });

  const textFieldProps = {
    boardType,
    title,
    content,
    tags,
    tagInput,
    onTitleChange: setTitle,
    onContentChange: setContent,
    onTagInputChange: setTagInput,
    onTagsChange: setTags,
  };

  const mappedRoutePath = useMemo(() => {
    if (!selectedCourse) return [];
    return selectedCourse.routePolyline.map((point) => ({
      latitude: point.y,
      longitude: point.x,
    }));
  }, [selectedCourse]);

  const createPostMutation = useMutation({
    mutationFn: CommunityApi.createPost,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
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
      CommunityApi.editPost(Number(postId), payload),
    onSuccess: () => {
      // [Analytics] 게시글 수정 트래픽 기록
      AnalyticsHelper.logEvent("post_edited", {
        boardType,
        hasCourse: !!selectedCourse,
      });
      Alert.alert("성공", "게시글이 수정되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
      queryClient.invalidateQueries({
        queryKey: ["postDetail", Number(postId)],
      });
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
    onError: () => {
      Alert.alert("오류", "게시글 수정에 실패했습니다.");
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: CommunityApi.saveDraftPost,
    onSuccess: () => {
      // [Analytics] 게시글 임시저장 트래픽 기록
      AnalyticsHelper.logEvent("post_draft_saved", { boardType });

      queryClient.invalidateQueries({ queryKey: ["draftPosts"] });

      setTitle("");
      setContent("");
      setImages([]);
      setTags([]);
      setTagInput("");
      setSelectedCourse(null);

      Alert.alert("임시저장", "게시글이 임시저장 되었습니다.");
    },
    onError: () => {
      Alert.alert("오류", "임시저장에 실패했습니다.");
    },
  });

  const hasInput = useMemo(() => {
    return (
      title.trim().length > 0 ||
      content.trim().length > 0 ||
      images.length > 0 ||
      tags.length > 0 ||
      selectedCourse !== null
    );
  }, [title, content, images, tags, selectedCourse]);

  const handleTabChange = useCallback((type: BoardType) => {
    // [Analytics] 작성 탭 변경 트래픽 기록
    AnalyticsHelper.logEvent("create_post_tab_changed", { to: type });
    setBoardType(type);
  }, []);

  const isLocalImage = (uri: string) => {
    return uri.startsWith("file://") || uri.startsWith("content://");
  };

  const uploadImagesAndGetKeys = async (): Promise<string[]> => {
    const localImages = images.filter(isLocalImage);
    const existingImageKeys = images.filter((img) => !isLocalImage(img));

    if (localImages.length > 0) {
      const blobDataArray = await Promise.all(
        localImages.map(async (uri) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          return {
            blob,
            fileName: uri.split("/").pop() || `image-${Date.now()}.jpg`,
            contentType: blob.type || "image/jpeg",
            size: blob.size,
          };
        }),
      );

      const filesInfo = blobDataArray.map((data) => ({
        fileName: data.fileName,
        contentType: data.contentType,
        size: data.size,
      }));

      const { items: presignedFiles } = await CommunityApi.getPresignedUrls({
        domain: "POST",
        files: filesInfo,
      });

      if (presignedFiles.length !== blobDataArray.length) {
        throw new Error("이미지 업로드 URL 개수가 요청한 파일 수와 다릅니다.");
      }

      const uploadedKeys = await Promise.all(
        presignedFiles.map(async (fileData, index) => {
          await CommunityApi.uploadFileToS3(
            fileData.uploadUrl,
            blobDataArray[index].blob,
            blobDataArray[index].contentType,
          );
          return fileData.imageKey;
        }),
      );

      return [...existingImageKeys, ...uploadedKeys];
    }

    return existingImageKeys;
  };

  const handleSubmit = async () => {
    if (
      isUploading ||
      createPostMutation.isPending ||
      editPostMutation.isPending
    ) {
      return;
    }
    if (isEditMode && (!hasValidPostId || !editPostData || isEditDataError)) {
      return Alert.alert("오류", "게시글 정보를 확인한 뒤 다시 시도해주세요.");
    }
    if (!title.trim()) return Alert.alert("알림", "제목을 입력해주세요.");
    if (!content.trim()) return Alert.alert("알림", "내용을 입력해주세요.");
    if (boardType === "COURSE" && !selectedCourse) {
      return Alert.alert("알림", "러닝 코스를 첨부해주세요.");
    }

    setIsUploading(true);

    try {
      const finalImageKeys = await uploadImagesAndGetKeys();

      const payload: PostUpsertRequest = {
        boardType,
        title,
        content,
        imageKeys: finalImageKeys,
        tags,
        runningRecordId: boardType === "COURSE" ? selectedCourse?.id : null,
        status: "PUBLISHED",
      };

      if (isEditMode) {
        editPostMutation.mutate(payload);
      } else {
        createPostMutation.mutate(payload);
      }
    } catch {
      Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isUploading || saveDraftMutation.isPending) return;
    if (boardType === "COURSE" && !selectedCourse) {
      return Alert.alert("알림", "러닝 코스를 첨부해야 임시저장이 가능합니다.");
    }

    setIsUploading(true);

    try {
      const finalImageKeys = await uploadImagesAndGetKeys();

      const payload: PostUpsertRequest = {
        boardType,
        title,
        content,
        imageKeys: finalImageKeys,
        tags,
        runningRecordId: boardType === "COURSE" ? selectedCourse?.id : null,
        status: "DRAFT",
      };

      saveDraftMutation.mutate(payload);
    } catch {
      Alert.alert(
        "오류",
        "이미지 처리 중 문제가 발생해 임시저장에 실패했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDraft = (draft: PostDetailResponse) => {
    setBoardType(draft.boardType);
    setTitle(draft.title);
    setContent(draft.content);
    setImages(draft.imageKeys || []);
    setTags(draft.tags || []);

    if (draft.boardType === "COURSE" && draft.runningRecordId) {
      setSelectedCourse({
        id: draft.runningRecordId,
        title: "불러온 코스",
        createdAt: draft.createdAt,
        targetDistanceKm: 0,
        avgPaceSec: 0,
        locationName: "",
        address: "",
        routePolyline: [],
        markers: [],
      });
    } else {
      setSelectedCourse(null);
    }
    setDraftModalVisible(false);
  };

  if (
    isEditMode &&
    (isEditDataLoading ||
      (editPostData?.boardType === "COURSE" &&
        editPostData.runningRecordId !== null &&
        isRunningRecordsLoading))
  ) {
    return <LoadingScreen message="게시글 정보를 불러오는 중..." />;
  }

  if (isEditMode && (!hasValidPostId || isEditDataError || !editPostData)) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.editErrorContainer}>
          <Text style={styles.editErrorText}>
            게시글 정보를 불러오지 못했습니다.
          </Text>
          <Button variant="primary" onPress={() => void refetchEditPost()}>
            다시 시도
          </Button>
          <Button variant="text" onPress={() => router.back()}>
            돌아가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <PostCreateHeader
        isEditMode={isEditMode}
        hasInput={hasInput}
        draftCount={draftPosts?.length ?? 0}
        isSavingDraft={isUploading || saveDraftMutation.isPending}
        onBack={() => router.back()}
        onSaveDraft={handleSaveDraft}
        onLoadDrafts={() => setDraftModalVisible(true)}
      />
      <PostCreateTabs boardType={boardType} onChange={handleTabChange} />

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
              <PostImageSection images={images} onChange={setImages} />
              <PostTextFields {...textFieldProps} />
            </>
          ) : (
            <>
              <PostTextFields {...textFieldProps} />
              <PostCourseSection
                selectedCourse={selectedCourse}
                routePath={mappedRoutePath}
                onOpenCoursePicker={() => setCourseModalVisible(true)}
                onRemoveCourse={() => setSelectedCourse(null)}
              />
              <PostImageSection images={images} onChange={setImages} />
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
      <PostDraftModal
        visible={isDraftModalVisible}
        drafts={draftPosts}
        onClose={() => setDraftModalVisible(false)}
        onSelect={handleLoadDraft}
      />
    </SafeAreaView>
  );
}
