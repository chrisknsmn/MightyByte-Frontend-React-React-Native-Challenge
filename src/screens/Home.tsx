// src/screens/Home.tsx
import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { useYoutubeSearch } from '../hooks/useYoutubeSearch';
import { useNumColumns } from '../utils/layout';
import VideoCard from '../components/VideoCard';
import EnterApiKey from '../components/EnterApiKey';
import { getYoutubeApiKey } from '../utils/env';

export default function Home() {
  const cols = useNumColumns();
  const key = getYoutubeApiKey();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useYoutubeSearch();

  if (!key) return <EnterApiKey onSaved={() => location.reload()} />;

  if (status === 'pending') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text>{String((error as Error).message)}</Text>
      </View>
    );
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <FlatList
      contentContainerStyle={{ padding: 12 }}
      data={items}
      numColumns={cols}
      key={cols} // force re-layout on breakpoint change
      keyExtractor={(it) => it.id.videoId}
      renderItem={({ item }) => <VideoCard item={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.6}
      ListFooterComponent={() =>
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      initialNumToRender={12}
      windowSize={8}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
});
