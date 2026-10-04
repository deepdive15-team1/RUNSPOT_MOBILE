import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { styles } from "@/src/components/community/styles/PostCreate.styles";
import { colors } from "@/src/constants";
import type { PastCourse } from "@/src/types/domain/course";
import { secondsToPaceString } from "@/src/utils";
import { formatDate } from "@/src/utils/date";

interface PostCourseSectionProps {
  selectedCourse: PastCourse | null;
  routePath: { latitude: number; longitude: number }[];
  onOpenCoursePicker: () => void;
  onRemoveCourse: () => void;
}

export function PostCourseSection({
  selectedCourse,
  routePath,
  onOpenCoursePicker,
  onRemoveCourse,
}: PostCourseSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>러닝 코스</Text>
      {!selectedCourse ? (
        <Pressable style={styles.addCourseButton} onPress={onOpenCoursePicker}>
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
            <Pressable onPress={onRemoveCourse} hitSlop={10}>
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
            {routePath.length > 0 ? (
              <View style={StyleSheet.absoluteFillObject}>
                <NaverMapComponent
                  camera={{
                    latitude: routePath[0].latitude,
                    longitude: routePath[0].longitude,
                    zoom: 14,
                  }}
                  routePath={routePath}
                  isScrollGesturesEnabled={false}
                  isZoomGesturesEnabled={false}
                  showLocationButton={false}
                  isShowZoomControls={false}
                />
              </View>
            ) : (
              <>
                <Ionicons name="map-outline" size={32} color={colors.gray400} />
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
}
