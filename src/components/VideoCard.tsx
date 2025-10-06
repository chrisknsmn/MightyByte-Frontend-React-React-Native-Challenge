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
