import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../constants/theme';
import Button from '../../components/Button';

export default function LoginScreen({ navigation, onAuthComplete }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!mobileNumber.trim()) return;

    setLoading(true);
    console.log('Sending OTP to mobile number:', mobileNumber);

    // TODO: Implement Firebase phone authentication
    // TODO: Send OTP to mobile number
    setTimeout(() => {
      setLoading(false);
      setIsOtpSent(true);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;

    setLoading(true);

    // TODO: Verify OTP with Firebase
    setTimeout(() => {
      setLoading(false);
      // Use the callback to complete authentication
      onAuthComplete();
    }, 1500);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    // TODO: Resend OTP
    setTimeout(() => {
      setResendLoading(false);
    }, 1000);
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const formatMobileNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Format as XXX-XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    return cleaned;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              {isOtpSent
                ? `Enter the verification code sent to ${mobileNumber}`
                : 'Sign in with your mobile number'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isOtpSent ? (
              <>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+1</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Mobile Number"
                    placeholderTextColor={COLORS.placeholder}
                    value={mobileNumber}
                    onChangeText={(text) =>
                      setMobileNumber(formatMobileNumber(text))
                    }
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                </View>

                <Button
                  title="Send Verification Code"
                  onPress={handleSendOtp}
                  loading={loading}
                  style={styles.sendOtpButton}
                  disabled={mobileNumber.length < 12}
                />
              </>
            ) : (
              <>
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
                  title="Verify & Sign In"
                  onPress={handleVerifyOtp}
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
                  style={styles.changeNumber}
                  onPress={() => {
                    setIsOtpSent(false);
                    setOtp('');
                  }}
                >
                  <Text style={styles.changeNumberText}>
                    Change mobile number
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
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
  sendOtpButton: {
    marginTop: SPACING.md,
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
  changeNumber: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  changeNumberText: {
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
  signUpText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
});
