import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";

import { getSessionDetail } from "@/src/api/session-detail/sessionDetailApi.index";
import CalendarSvg from "@/src/assets/icon/session-detail/calendar.svg";
import LocationSvg from "@/src/assets/icon/session-detail/location.svg";
import PeopleSvg from "@/src/assets/icon/session-detail/people.svg";
import TimeSvg from "@/src/assets/icon/session-detail/time.svg";
import Chip from "@/src/components/common/chip";
import { NaverMapComponent } from "@/src/components/common/map/NaverMapComponent";
import { BottomSubmit } from "@/src/components/session-detail/BottomSubmit";
import { SessionDetailStyles as styles } from "@/src/components/session-detail/SessionDetail.styles";
import { colors } from "@/src/constants";
import { GENDER_INFO, RUN_TYPE_INFO } from "@/src/constants/session";
import { secondsToPaceString } from "@/src/utils";
import { formatDisplayDate } from "@/src/utils/date";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["session", "detail", sessionId],
    queryFn: () => getSessionDetail(sessionId),
    enabled: !isNaN(sessionId),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.main} />
        <Text style={styles.loadingText}>로딩 중</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          데이터를 불러오는 중 에러가 발생했습니다.
        </Text>
      </View>
    );
  }

  const participants = data.participants ?? [];
  const participantCount = participants.length;

  const genderInfo = GENDER_INFO[data.genderPolicy] || GENDER_INFO.MIXED;
  const runTypeInfo = RUN_TYPE_INFO[data.runType] || RUN_TYPE_INFO.LSD;

  const routePolyline = (data.routePolyline ?? []).map((point) => ({
    latitude: point.y,
    longitude: point.x,
  }));

  const initialCamera =
    routePolyline.length > 0
      ? {
          latitude: routePolyline[0].latitude,
          longitude: routePolyline[0].longitude,
          zoom: 14,
        }
      : { latitude: 37.5271, longitude: 126.9233, zoom: 14 };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          <NaverMapComponent
            camera={initialCamera}
            routePath={routePolyline}
            isScrollGesturesEnabled={true}
            isZoomGesturesEnabled={true}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.subTitle}>{runTypeInfo.label}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: colors.greenLight },
                ]}
              >
                <CalendarSvg width={20} height={20} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>일정</Text>
                <Text style={styles.infoValue}>
                  {formatDisplayDate(data.startAt)}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: colors.greenLight },
                ]}
              >
                <LocationSvg width={20} height={20} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>모임 장소</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {data.locationName}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: colors.redLight },
                ]}
              >
                <TimeSvg width={20} height={20} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>평균 페이스</Text>
                <Text style={styles.infoValue}>
                  {secondsToPaceString(data.avgPaceSec)}/km
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: colors.redLight },
                ]}
              >
                <PeopleSvg width={20} height={20} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>참여 성별</Text>
                <Text style={styles.infoValue}>{genderInfo.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>호스트</Text>
            <View style={styles.hostProfile}>
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.iconText}>
                  {data.hostName ? data.hostName.slice(0, 1) : "?"}
                </Text>
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{data.hostName}</Text>
                <Chip
                  label={`매너온도 ${data.hostMannerTemp}`}
                  size="small"
                  color="green"
                />
              </View>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              참여자 ({participantCount}명 참여 중)
            </Text>
            <View style={styles.participantList}>
              {data.participants?.slice(0, 3).map((participants, index) => (
                <View key={index} style={styles.profileAvatarPlaceholder}>
                  <Text style={styles.iconText}>
                    {participants.slice(0, 1)}
                  </Text>
                </View>
              ))}
              {participants.length > 3 && (
                <View
                  style={[
                    styles.profileAvatarPlaceholder,
                    { backgroundColor: colors.gray300 },
                  ]}
                >
                  <Text
                    style={[styles.iconText, { color: colors.textSecondary }]}
                  >
                    +{participants.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.submitSection}>
          <BottomSubmit sessionId={sessionId} />
        </View>
      </ScrollView>
    </View>
  );
}
