import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../constants/theme';
import Button from '../../components/Button';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    mobileNumber: '',
  });
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatMobileNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  const handleSendOtp = async () => {
    if (
      !formData.name.trim() ||
      !formData.username.trim() ||
      !formData.mobileNumber.trim()
    )
      return;

    setLoading(true);

    // TODO: Implement Firebase phone authentication
    // TODO: Send OTP to mobile number
    setTimeout(() => {
      setLoading(false);
      setIsOtpSent(true);
    }, 1500);
  };

  const handleVerifyAndRegister = async () => {
    if (!otp.trim()) return;

    setLoading(true);

    // TODO: Verify OTP with Firebase
    // TODO: Create user account
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SetupProfile', { userData: formData });
    }, 1500);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    // TODO: Resend OTP
    setTimeout(() => {
      setResendLoading(false);
    }, 1000);
  };

  const handleSignIn = () => {
    navigation.goBack();
  };

  const isFormValid =
    formData.name.trim() &&
    formData.username.trim() &&
    formData.mobileNumber.length >= 12;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                {isOtpSent
                  ? `Enter the verification code sent to ${formData.mobileNumber}`
                  : 'Join us and start shopping!'}
              </Text>
            </View>

            <View style={styles.form}>
              {!isOtpSent ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={COLORS.placeholder}
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    autoCapitalize="words"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={COLORS.placeholder}
                    value={formData.username}
                    onChangeText={(value) =>
                      updateFormData(
                        'username',
                        value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                      )
                    }
                    autoCapitalize="none"
                  />

                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.countryCode}>+1</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Mobile Number"
                      placeholderTextColor={COLORS.placeholder}
                      value={formData.mobileNumber}
                      onChangeText={(text) =>
                        updateFormData('mobileNumber', formatMobileNumber(text))
                      }
                      keyboardType="phone-pad"
                      maxLength={12}
                    />
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                      📧 We'll ask for your email in the next step{'\n'}
                      🔒 Your mobile number will be verified with OTP{'\n'}✨
                      Complete profile setup after verification
                    </Text>
                  </View>

                  <Button
                    title="Send Verification Code"
                    onPress={handleSendOtp}
                    loading={loading}
                    style={styles.registerButton}
                    disabled={!isFormValid}
                  />
                </>
              ) : (
                <>
                  <View style={styles.userInfo}>
                    <Text style={styles.userInfoText}>
                      Creating account for:
                    </Text>
                    <Text style={styles.userName}>
                      {formData.name} (@{formData.username})
                    </Text>
                  </View>

                  <View style={styles.otpContainer}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="6-digit code"
                      placeholderTextColor={COLORS.placeholder}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      textAlign="center"
                    />
                  </View>

                  <Button
                    title="Verify & Create Account"
                    onPress={handleVerifyAndRegister}
                    loading={loading}
                    style={styles.verifyButton}
                    disabled={otp.length < 6}
                  />

                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive code? </Text>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={resendLoading}
                    >
                      <Text style={styles.resendLink}>
                        {resendLoading ? 'Sending...' : 'Resend'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.changeInfo}
                    onPress={() => {
                      setIsOtpSent(false);
                      setOtp('');
                    }}
                  >
                    <Text style={styles.changeInfoText}>
                      Change information
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
    fontSize: FONT_SIZES['3xl'],
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: SPACING.xl,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  countryCode: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: COLORS.orange[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.orange[200],
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  userInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.xl,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    width: 200,
    fontWeight: '600',
    letterSpacing: 8,
  },
  verifyButton: {
    marginBottom: SPACING.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resendText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  changeInfo: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  changeInfoText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
  },
  signInText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
});
