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
