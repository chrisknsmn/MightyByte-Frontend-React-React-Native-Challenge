// src/screens/Home.tsx
import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  Pressable,
} from 'react-native';
import { useYoutubeSearch } from '../hooks/useYoutubeSearch';
import VideoCard from '../components/VideoCard';
import EnterApiKey from '../components/EnterApiKey';
import { getYoutubeApiKey } from '../utils/env';

export default function Home() {
  const cols = 4; // Fixed 4 columns
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
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ padding: 12 }}
          data={items}
          numColumns={cols}
          key={cols}
          keyExtractor={(it) => it.id.videoId}
          renderItem={({ item }) => <VideoCard item={item} />}
          ListFooterComponent={() => (
            <View style={styles.footer}>
              {isFetchingNextPage ? (
                <ActivityIndicator />
              ) : hasNextPage ? (
                <Pressable
                  onPress={() => fetchNextPage()}
                  style={styles.showMoreButton}
                >
                  <Text style={styles.showMoreText}>Show More</Text>
                </Pressable>
              ) : null}
            </View>
          )}
          initialNumToRender={16}
          windowSize={8}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: '100%',
    maxWidth: 1200,
    flex: 1,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  showMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  showMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
