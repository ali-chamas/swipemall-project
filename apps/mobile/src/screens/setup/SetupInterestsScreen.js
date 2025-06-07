import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../constants/theme';
import Button from '../../components/Button';

const INTEREST_CATEGORIES = [
  { id: 1, name: 'Fashion & Clothing', icon: '👗', color: '#FF6B6B' },
  { id: 2, name: 'Electronics', icon: '📱', color: '#4ECDC4' },
  { id: 3, name: 'Home & Garden', icon: '🏠', color: '#45B7D1' },
  { id: 4, name: 'Sports & Fitness', icon: '⚽', color: '#96CEB4' },
  { id: 5, name: 'Beauty & Health', icon: '💄', color: '#FFEAA7' },
  { id: 6, name: 'Books & Media', icon: '📚', color: '#DDA0DD' },
  { id: 7, name: 'Toys & Games', icon: '🎮', color: '#FFB6C1' },
  { id: 8, name: 'Food & Beverages', icon: '🍕', color: '#98D8C8' },
  { id: 9, name: 'Automotive', icon: '🚗', color: '#A0C4FF' },
  { id: 10, name: 'Art & Crafts', icon: '🎨', color: '#FFCAB0' },
];

export default function SetupInterestsScreen({
  navigation,
  route,
  onSetupComplete,
}) {
  const { userData } = route.params;
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.find((item) => item.id === interest.id)) {
        return prev.filter((item) => item.id !== interest.id);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleComplete = async () => {
    setLoading(true);

    // TODO: Save all user data to Firebase and authenticate
    const finalUserData = { ...userData, interests: selectedInterests };

    setTimeout(() => {
      setLoading(false);
      // Use the callback to complete setup and authentication
      onSetupComplete();
    }, 1500);
  };

  const handleSkip = () => {
    // Use the callback to complete setup without interests
    onSetupComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>What interests you?</Text>
            <Text style={styles.subtitle}>
              Select categories to get personalized recommendations
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.activeStep]} />
            </View>
          </View>

          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>
              Choose your interests ({selectedInterests.length})
            </Text>

            <View style={styles.interestsGrid}>
              {INTEREST_CATEGORIES.map((interest) => {
                const isSelected = selectedInterests.find(
                  (item) => item.id === interest.id
                );

                return (
                  <TouchableOpacity
                    key={interest.id}
                    style={[
                      styles.interestCard,
                      isSelected && styles.selectedInterestCard,
                      { borderColor: interest.color },
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={styles.interestIcon}>{interest.icon}</Text>
                    <Text
                      style={[
                        styles.interestName,
                        isSelected && styles.selectedInterestName,
                      ]}
                    >
                      {interest.name}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkmark,
                          { backgroundColor: interest.color },
                        ]}
                      >
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Why we ask this?</Text>
              <Text style={styles.infoText}>
                • Personalized product recommendations{'\n'}• Relevant deals and
                offers{'\n'}• Customized home feed{'\n'}• Better swipe
                experience
              </Text>
              <Text style={styles.backendNote}>
                🔄 Interests will be stored in Firebase for personalization
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title={`Complete Setup ${selectedInterests.length > 0 ? `(${selectedInterests.length} selected)` : ''}`}
              onPress={handleComplete}
              loading={loading}
              style={styles.completeButton}
            />

            <Button
              title="Skip for now"
              variant="secondary"
              onPress={handleSkip}
              style={styles.skipButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  progressStep: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  completedStep: {
    backgroundColor: COLORS.success,
  },
  interestsSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  interestCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    position: 'relative',
  },
  selectedInterestCard: {
    backgroundColor: COLORS.orange[50],
    borderColor: COLORS.primary,
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  interestName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedInterestName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  backendNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  actions: {
    gap: SPACING.md,
  },
  completeButton: {
    marginBottom: SPACING.sm,
  },
  skipButton: {
    // Custom styling for skip button
  },
});
