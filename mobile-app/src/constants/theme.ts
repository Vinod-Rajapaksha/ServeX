export const COLORS = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  accent: '#F5A623',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  error: '#D0021B',
  text: '#212529',
  textLight: '#6C757D',
  border: '#DEE2E6',
  white: '#FFFFFF',
  black: '#000000',
  success: '#28A745',
  warning: '#FFC107',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
};
