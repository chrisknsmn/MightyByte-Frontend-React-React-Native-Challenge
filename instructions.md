# MightyByte Frontend React Native Web — YouTube Grid Clone

Hi, I’m Christopher Kinsman. Below is a single-file **implementation guide** with all source files you can paste into the provided CodeSandbox skeleton. It uses **React Native Web** + **React Query** to implement the YouTube-style grid with **infinite scroll** and a **hover preview popup** (thumbnail only), styled with **React Native `StyleSheet`** only.

---

## What this delivers

- YouTube home **video grid** UI (thumbnail, title, channel, publish date).
- **Hover preview popup** on web (fade/scale in, closes on mouse out).
- **Infinite scrolling** using `nextPageToken`.
- **RN-only styling** (`StyleSheet`, no CSS frameworks).
- **No secrets leak**: API key read from runtime env or `localStorage` (enter once via in-app screen). Include only `.env.example` in files.

---

## Add these dependencies

In the CodeSandbox terminal (or Dependencies panel), add:

- `@tanstack/react-query` (v5+)

> *No other UI libs; styling is pure RN.*

---

## File structure

Create these files under `src/`:

/src
/api
youtube.ts
/components
EnterApiKey.tsx
VideoCard.tsx
/hooks
useYoutubeSearch.ts
/screens
Home.tsx
/utils
env.ts
layout.ts
App.tsx
.env.example

yaml
Copy code

---

## `.env.example`

```ini
# Copy to a private .env in your local dev if needed (do NOT commit an actual key).
YT_API_KEY=
src/utils/env.ts
ts
Copy code
// src/utils/env.ts
export function getYoutubeApiKey(): string | undefined {
  const fromEnv =
    (typeof process !== 'undefined' && (process as any).env?.YT_API_KEY) ||
    (typeof import_meta !== 'undefined' && (import_meta as any).env?.YT_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.YT_API_KEY);

  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();

  if (typeof window !== 'undefined') {
    const ls = window.localStorage.getItem('YT_API_KEY');
    if (ls && ls.trim()) return ls.trim();
  }
  return undefined;
}
src/api/youtube.ts
ts
Copy code
// src/api/youtube.ts
import { getYoutubeApiKey } from '../utils/env';

export type YTSearchItem = {
  id: { kind: string; videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width?: number; height?: number };
    };
  };
};

export type YTSearchPage = {
  items: YTSearchItem[];
  nextPageToken?: string;
};

const BASE = 'https://www.googleapis.com/youtube/v3/search';

export async function searchProgrammingVideos(
  pageToken?: string,
  maxResults = 50
): Promise<YTSearchPage> {
  const key = getYoutubeApiKey();
  if (!key) throw new Error('Missing YT API key');

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: 'programming',
    maxResults: String(maxResults),
    key,
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  return res.json();
}
src/hooks/useYoutubeSearch.ts
ts
Copy code
// src/hooks/useYoutubeSearch.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchProgrammingVideos } from '../api/youtube';

export function useYoutubeSearch() {
  return useInfiniteQuery({
    queryKey: ['yt', 'programming'],
    queryFn: ({ pageParam }) => searchProgrammingVideos(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
  });
}
src/utils/layout.ts
ts
Copy code
// src/utils/layout.ts
import { useEffect, useState } from 'react';

export function useNumColumns(): number {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (width >= 1400) return 6;
  if (width >= 1200) return 5;
  if (width >= 992) return 4;
  if (width >= 768) return 3;
  if (width >= 520) return 2;
  return 1;
}
src/components/EnterApiKey.tsx
tsx
Copy code
// src/components/EnterApiKey.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

export default function EnterApiKey({ onSaved }: { onSaved: () => void }) {
  const [val, setVal] = useState('');

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        Enter YouTube Data API v3 Key
      </Text>
      <TextInput
        value={val}
        onChangeText={setVal}
        placeholder="YT API Key"
        style={{
          width: 420,
          maxWidth: '90%',
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
        }}
      />
      <Pressable
        onPress={() => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('YT_API_KEY', val.trim());
          }
          onSaved();
        }}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: '#000',
          borderRadius: 8,
        }}
        accessibilityLabel="Save API Key"
      >
        <Text style={{ color: '#fff' }}>Save</Text>
      </Pressable>
      <Text style={{ color: '#666', textAlign: 'center' }}>
        Your key is stored in this browser’s localStorage and is not saved in the sandbox
        files.
      </Text>
    </View>
  );
}
src/components/VideoCard.tsx
tsx
Copy code
// src/components/VideoCard.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import type { YTSearchItem } from '../api/youtube';

export default function VideoCard({ item }: { item: YTSearchItem }) {
  const thumb =
    item.snippet.thumbnails.high?.url ||
    item.snippet.thumbnails.medium?.url ||
    '';

  // Hover preview state (web only)
  const [hover, setHover] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const showTimer = useRef<number | null>(null);

  const onHoverIn = () => {
    if (Platform.OS !== 'web') return;
    showTimer.current = window.setTimeout(() => {
      setHover(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
      ]).start();
    }, 250);
  };

  const onHoverOut = () => {
    if (showTimer.current) window.clearTimeout(showTimer.current);
    Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setHover(false);
      scale.setValue(0.98);
    });
  };

  return (
    <View style={styles.card}>
      <Pressable
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        accessibilityRole="imagebutton"
      >
        <Image source={{ uri: thumb }} style={styles.thumbnail} resizeMode="cover" />

        <View style={styles.meta}>
          <Text numberOfLines={2} style={styles.title}>
            {item.snippet.title}
          </Text>
          <Text style={styles.subtle}>{item.snippet.channelTitle}</Text>
          <Text style={styles.subtle}>
            {new Date(item.snippet.publishedAt).toLocaleDateString('en-US')}
          </Text>
        </View>

        {hover && Platform.OS === 'web' && (
          <Animated.View style={[styles.preview, { opacity, transform: [{ scale }] }]}>
            <Image source={{ uri: thumb }} style={styles.previewImg} resizeMode="cover" />
          </Animated.View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 8 },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  meta: { marginTop: 8, gap: 4 },
  title: { fontSize: 14, fontWeight: '600' },
  subtle: { fontSize: 12, color: '#666' },
  preview: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: '92%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    backgroundColor: '#000',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  previewImg: { width: '100%', height: '100%' },
});
src/screens/Home.tsx
tsx
Copy code
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
src/App.tsx
tsx
Copy code
// src/App.tsx
import React from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './screens/Home';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <SafeAreaView style={styles.root}>
        <StatusBar />
        <View style={styles.header}>
          <Text style={styles.logo}>YouTube-ish</Text>
        </View>
        <Home />
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: { fontSize: 18, fontWeight: '700' },
});
Submission checklist
Forked the provided CodeSandbox skeleton and pasted files above.

Added @tanstack/react-query.

Confirmed no API key in repo files; .env.example only.

In the running app, entered API key once (stored in localStorage).

Verified:

Grid renders with RN styles.

Infinite scroll fetches more results.

Hover popup shows/hides smoothly on web.

Dates displayed as MM/DD/YYYY.

Email subject:

nginx
Copy code
MightyByte Frontend React Native Challenge, Christopher Kinsman
Email body:

CodeSandbox link

Brief implementation notes + AI disclosure (below)

