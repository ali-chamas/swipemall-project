import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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

export default function SetupLocationScreen({ navigation, route }) {
  const { userData } = route.params;
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);

    // TODO: Save location data to Firebase
    const updatedUserData = { ...userData, location };
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SetupInterests', { userData: updatedUserData });
    }, 1000);
  };

  const handleSkip = () => {
    navigation.navigate('SetupInterests', { userData });
  };

  const handleUseCurrentLocation = () => {
    // TODO: Implement geolocation
    setLocation('Current Location');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Where are you located?</Text>
            <Text style={styles.subtitle}>
              Help us provide better recommendations and shipping options
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressStep, styles.completedStep]} />
              <View style={[styles.progressStep, styles.activeStep]} />
              <View style={styles.progressStep} />
            </View>
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Enter your location</Text>

            <TextInput
              style={styles.input}
              placeholder="City, State or ZIP code"
              placeholderTextColor={COLORS.placeholder}
              value={location}
              onChangeText={setLocation}
            />

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.currentLocationText}>
                Use current location
              </Text>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Why we need this?</Text>
              <Text style={styles.infoText}>
                • Accurate shipping estimates{'\n'}• Local store recommendations
                {'\n'}• Region-specific deals{'\n'}• Better product availability
              </Text>
              <Text style={styles.backendNote}>
                🔄 Location data will be stored securely in Firebase
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleNext}
              loading={loading}
              style={styles.continueButton}
              disabled={!location.trim()}
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
  locationSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  currentLocationText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: '500',
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
  continueButton: {
    marginBottom: SPACING.sm,
  },
  skipButton: {
    // Custom styling for skip button
  },
});
