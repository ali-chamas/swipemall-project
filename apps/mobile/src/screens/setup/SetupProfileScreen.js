import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../constants/theme';
import Button from '../../components/Button';

export default function SetupProfileScreen({ navigation, route }) {
  const { userData } = route.params;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);

    // TODO: Save profile data to Firebase
    const updatedUserData = { ...userData, email };
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SetupLocation', { userData: updatedUserData });
    }, 1000);
  };

  const handleSkip = () => {
    navigation.navigate('SetupLocation', { userData });
  };

  const isEmailValid = email.includes('@') && email.includes('.');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Your Email</Text>
            <Text style={styles.subtitle}>
              We'll use this for order confirmations and important updates
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressStep, styles.activeStep]} />
              <View style={styles.progressStep} />
              <View style={styles.progressStep} />
            </View>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileImageText}>
                  {userData.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Button
                title="Add Photo"
                variant="secondary"
                style={styles.addPhotoButton}
                onPress={() => {
                  // TODO: Implement image picker
                }}
              />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Your Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{userData.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Username:</Text>
                <Text style={styles.infoValue}>@{userData.username}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile:</Text>
                <Text style={styles.infoValue}>{userData.mobileNumber}</Text>
              </View>
            </View>

            <View style={styles.emailSection}>
              <Text style={styles.sectionTitle}>Email Address</Text>
              <TextInput
                style={styles.emailInput}
                placeholder="your.email@example.com"
                placeholderTextColor={COLORS.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.emailInfo}>
                <Text style={styles.emailInfoText}>
                  📧 Used for order confirmations{'\n'}
                  🔔 Important account notifications{'\n'}
                  🎁 Special offers and updates{'\n'}
                  🔒 Your privacy is protected
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue"
              onPress={handleNext}
              loading={loading}
              style={styles.continueButton}
              disabled={!isEmailValid}
            />

            <Button
              title="Add email later"
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
    lineHeight: 24,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileImageText: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.background,
  },
  addPhotoButton: {
    paddingHorizontal: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  emailSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emailInfo: {
    backgroundColor: COLORS.orange[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.orange[200],
  },
  emailInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
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
