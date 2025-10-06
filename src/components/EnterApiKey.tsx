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
        Your key is stored in this browser's localStorage and is not saved in the sandbox
        files.
      </Text>
    </View>
  );
}
