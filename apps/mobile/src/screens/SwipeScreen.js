import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function SwipeScreen() {
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Swipe to Discover</Text>
          <Text style={styles.subtitle}>Find products you'll love</Text>
        </View>

        <View style={styles.swipeArea}>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>👆</Text>
            <Text style={styles.placeholderTitle}>
              Swipe Feature Coming Soon
            </Text>
            <Text style={styles.placeholderText}>
              This will be the main discovery feature where users can swipe
              through products
            </Text>
            <Text style={styles.backendNote}>
              🔄 Products will be loaded from Firebase backend with swipe
              gestures
            </Text>
          </View>
        </View>

        <View style={styles.actionHints}>
          <View style={styles.hintRow}>
            <Text style={styles.swipeIcon}>👍</Text>
            <Text style={styles.hintText}>Swipe right to like</Text>
          </View>
          <View style={styles.hintRow}>
            <Text style={styles.swipeIcon}>👎</Text>
            <Text style={styles.hintText}>Swipe left to pass</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  swipeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    width: '100%',
    maxWidth: 300,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  placeholderTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  backendNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionHints: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  swipeIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  hintText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
});
