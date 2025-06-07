const COLORS = {
  primary: '#F97B03',
  secondary: '#FF6B35',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',

  border: '#E5E7EB',
  separator: '#F3F4F6',

  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97B03',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  dark: {
    primary: '#FB923C',
    secondary: '#FF6B35',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',

    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',

    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    placeholder: '#48484A',

    border: '#38383A',
    separator: '#38383A',
  },
};

const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
};

export { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS };
