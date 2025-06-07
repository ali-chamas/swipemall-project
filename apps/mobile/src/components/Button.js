import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { COLORS } from '../constants/theme';

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style = {},
  textStyle = {},
}) {
  const getButtonStyle = () => {
    const baseStyle = { ...globalStyles.button };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: COLORS.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = { ...globalStyles.buttonText };

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        color: COLORS.primary,
      };
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && { opacity: 0.6 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? COLORS.primary : COLORS.background}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
