import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.container, { padding: 16 }]}>
        <Text style={globalStyles.title}>Settings</Text>
        <Text style={globalStyles.bodyText}>
          Settings screen coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
}
