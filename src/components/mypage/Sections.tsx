import { View, Text, ActivityIndicator } from "react-native";

import { Button } from "../common/button/Button";

import { EmptyState } from "./EmptyState";
import { MyPageCard } from "./MyPageCard";
import { styles } from "./styles/Sections.styles";

import ChatIcon from "@/src/assets/icon/my-page/chat.svg";
import CheckIcon from "@/src/assets/icon/my-page/check.svg";
import MannerIcon from "@/src/assets/icon/my-page/manner.svg";
import Chip from "@/src/components/common/chip";
import { colors } from "@/src/constants/index";
import type { UserProfile } from "@/src/types/api/mypage";
import { CreatedRunning } from "@/src/types/api/mypage";
import {
  AppliedRunningsResponse,
  RecentRunningsResponse,
} from "@/src/types/api/mypage";
import { formatDate } from "@/src/utils/date";

export interface SectionsProps<T> {
  data?: T;
  isFetching: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export const ProfileSection = ({
  data: profile,
  isFetching,
  isError,
  onRetry,
}: SectionsProps<UserProfile>) => {
  if (isFetching && !profile) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>내 정보를 불러오는 중</Text>
      </View>
    );
  }

  if (!profile) return null;

  if (isError) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
        <Button variant="outline" size="sm" onPress={onRetry}>
          다시 시도
        </Button>
      </View>
    );
  }
  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.name.charAt(profile.name.length - 1)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text
            style={styles.demographics}
          >{`${profile.ageGroup} · ${profile.gender}`}</Text>
          <Chip
            icon={<MannerIcon width={14} height={14} fill={colors.red} />}
            label={`매너온도 ${profile.mannerTemp}°C`}
            color="red"
            size="small"
            style={styles.mannerChip}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatBox
          label="주간 러닝"
          value={`평균 ${profile.weeklyRuns ?? 0}회`}
        />
        <StatBox label="평균 페이스" value={profile.avgPaceMinPerKm ?? "-"} />
        <StatBox label="총 러닝" value={`${profile.totalRuns ?? 0}회`} />
        <StatBox
          label="누적 거리"
          value={`${profile.totalDistanceKm ?? 0}km`}
        />
      </View>
    </View>
  );
};

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

export const CreatedRunsSection = ({
  data: runs = [],
  isFetching,
  isError,
  onRetry,
}: SectionsProps<CreatedRunning[]>) => {
  // TODO: 호스트 전용 러닝 관리 페이지 네비게이션 연결
  const handleManageRun = (runningId: number) => {
    // eslint-disable-next-line no-console
    console.log(`러닝 관리 페이지 이동: ${runningId}`);
  };

  if (isFetching && runs.length === 0) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>내가 만든 러닝을 불러오는 중</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
        <Button variant="outline" size="sm" onPress={onRetry}>
          다시 시도
        </Button>
      </View>
    );
  }
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>내가 만든 러닝</Text>
      {runs.length === 0 ? (
        <EmptyState text="생성한 러닝이 없습니다." />
      ) : (
        <View style={styles.cardListWrapper}>
          {runs.map((run) => (
            <MyPageCard
              key={run.id}
              title={run.title}
              subtitle={`모집 중 (${run.currentParticipants}/${run.capacity}명)`}
              rightElement={
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => handleManageRun(run.id)}
                >
                  관리
                </Button>
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const AppliedRunsSection = ({
  data,
  isFetching,
  isError,
  onRetry,
}: SectionsProps<AppliedRunningsResponse>) => {
  const runs = data?.appliedRunnings || [];
  // TODO: 채팅 페이지 네비게이션 연결
  const handleOpenChat = (runningId: number) => {
    // eslint-disable-next-line no-console
    console.log(`${runningId}번 채팅 열기`);
  };

  if (isFetching && runs.length === 0) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>최근 신청 내역을 불러오는 중</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
        <Button variant="outline" size="sm" onPress={onRetry}>
          다시 시도
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>신청한 러닝</Text>
      {runs.length === 0 ? (
        <EmptyState text="신청한 러닝이 없습니다." />
      ) : (
        <View style={styles.cardListWrapper}>
          {runs.map((run) => (
            <MyPageCard
              key={run.runningId}
              title={run.title}
              subtitle={`${formatDate(run.date)} ${run.time}`}
              rightElement={
                <View style={styles.rightActionStack}>
                  <Chip
                    label={
                      run.approveStatus === "APPROVED"
                        ? "참여 확정"
                        : "승인 대기"
                    }
                    color={
                      run.approveStatus === "APPROVED" ? "success" : "warning"
                    }
                    size="small"
                  />
                  {run.chatEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      wrapperStyle={{
                        alignSelf: "stretch",
                        alignItems: "center",
                      }}
                      onPress={() => handleOpenChat(run.runningId)}
                    >
                      <ChatIcon
                        width={16}
                        height={16}
                        color={colors.textSecondary}
                      />
                    </Button>
                  )}
                </View>
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const RecentHistorySection = ({
  data,
  isFetching,
  isError,
  onRetry,
}: SectionsProps<RecentRunningsResponse>) => {
  const runs = data?.recentRunnings || [];
  // TODO: 러닝 완료 후 평가 페이지 네비게이션 연결
  const handleRate = (id: number) => {
    // eslint-disable-next-line no-console
    console.log("평가 페이지로 이동, runningId:", id);
  };

  if (isFetching && runs.length === 0) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>최근 참여 내역을 불러오는 중</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.sectionContainer, styles.centerBox]}>
        <Text style={styles.errorText}>데이터를 불러오지 못했습니다.</Text>
        <Button variant="outline" size="sm" onPress={onRetry}>
          다시 시도
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>최근 참여 내역</Text>
      {runs.length === 0 ? (
        <EmptyState text="최근 참여 내역이 없습니다." />
      ) : (
        <View style={styles.cardListWrapper}>
          {runs.map((run) => (
            <MyPageCard
              key={run.runningId}
              title={run.title}
              subtitle={
                run.resultStatus === "DONE" && (
                  <View style={styles.subtitleWithIcon}>
                    <CheckIcon width={14} height={14} color={colors.success} />
                    <Text style={styles.subtitleText}>완료</Text>
                  </View>
                )
              }
              leftElement={
                <View style={styles.dateBox}>
                  <Text style={styles.dateBoxText}>{formatDate(run.date)}</Text>
                </View>
              }
              rightElement={
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleRate(run.runningId)}
                >
                  평가하기
                </Button>
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};
