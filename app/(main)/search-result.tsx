import { useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchSessions } from "@/src/api/search/searchApi.index";
import BackSvg from "@/src/assets/icon/back.svg";
import CloseSvg from "@/src/assets/icon/cancel.svg";
import SearchSvg from "@/src/assets/icon/search.svg";
import { Input } from "@/src/components/common/Input/Input";
import { Button } from "@/src/components/common/button/Button";
import { RunCard } from "@/src/components/search-result/RunCard";
import { searchStyles as styles } from "@/src/components/search-result/SearchResult.styles";
import { theme } from "@/src/constants";
import { useDebounce } from "@/src/hooks/search/useDebounce";
import type { SearchParamType } from "@/src/types/api/search";

type SessionSearchQueryKey = ["sessions", "search", string];

export default function SearchResultScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const searchQuery = q || "";

  const [searchValue, setSearchValue] = useState(searchQuery);
  const debouncedQuery = useDebounce(searchValue, 500);

  const router = useRouter();

  const insets = useSafeAreaInsets();

  const inputRef = useRef<TextInput>(null);

  const fetchSessions = async ({
    pageParam,
    queryKey,
  }: QueryFunctionContext<SessionSearchQueryKey, number | null>) => {
    const keyword = queryKey[2];

    const params: SearchParamType = {
      q: keyword,
      size: 10,
    };

    if (pageParam) params.cursorId = pageParam;

    return searchSessions(params);
  };

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, []);

  const handleSearchSubmit = () => {
    inputRef.current?.blur();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["sessions", "search", debouncedQuery] as SessionSearchQueryKey,
    queryFn: fetchSessions,
    initialPageParam: null,
    enabled: !!debouncedQuery,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) {
        return undefined;
      }
      const lastItem = lastPage.content[lastPage.content.length - 1];
      return lastItem ? lastItem.id : undefined;
    },
  });

  const sessionList = useMemo(() => {
    return data?.pages.flatMap((page) => page.content || []) || [];
  }, [data]);

  const handleClear = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.headerRow, { paddingTop: insets.top + 10 }]}>
        <View>
          <Button variant="text" onPress={() => router.back()} iconOnly>
            <BackSvg width={24} height={24} color={theme.colors.gray900} />
          </Button>
        </View>

        <Input
          placeholder="지역 또는 크루 검색"
          value={searchValue}
          onChangeText={setSearchValue}
          onSubmitEditing={handleSearchSubmit}
          wrapperStyle={{ flex: 1 }}
          containerStyle={styles.searchInputContainer}
          ref={inputRef}
          endIcon={
            searchValue.length > 0 ? (
              <Pressable
                onPress={handleClear}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseSvg width={20} height={20} color={theme.colors.gray500} />
              </Pressable>
            ) : (
              <SearchSvg width={20} height={20} color={theme.colors.gray500} />
            )
          }
        />
      </View>
      {!debouncedQuery ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            원하시는 러닝 지역을 검색해 보세요
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            데이터를 불러오는 중 에러가 발생했습니다.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>검색 결과</Text>
          </View>
          <FlatList
            style={{ flex: 1 }}
            data={sessionList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RunCard {...item} />}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  style={styles.footerLoader}
                  size="small"
                  color={theme.colors.primary}
                />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                tintColor={theme.colors.primary}
              />
            }
          />
        </>
      )}
    </View>
  );
}
