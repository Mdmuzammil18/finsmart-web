/**
 * Design tokens converted from the shared shadcn globals.css design system.
 */

export const light = {
  background:           '#ffffff',
  foreground:           '#1a1a1f',
  card:                 '#ffffff',
  cardForeground:       '#1a1a1f',
  popover:              '#ffffff',
  popoverForeground:    '#1a1a1f',
  primary:              '#030213',
  primaryForeground:    '#ffffff',
  secondary:            '#f0f1f8',
  secondaryForeground:  '#030213',
  muted:                '#ececf0',
  mutedForeground:      '#717182',
  accent:               '#e9ebef',
  accentForeground:     '#030213',
  destructive:          '#d4183d',
  destructiveForeground:'#ffffff',
  border:               'rgba(0,0,0,0.10)',
  input:                'transparent',
  inputBackground:      '#f3f3f5',
  switchBackground:     '#cbced4',
  ring:                 '#b3b3b3',
  // Charts
  chart1:               '#e05c26',
  chart2:               '#1aad9c',
  chart3:               '#2d5a8a',
  chart4:               '#c9c000',
  chart5:               '#d4aa00',
  // Sidebar
  sidebar:              '#f9f9f9',
  sidebarForeground:    '#1a1a1f',
  sidebarPrimary:       '#030213',
  sidebarPrimaryForeground: '#f9f9f9',
  sidebarAccent:        '#f5f5f5',
  sidebarAccentForeground: '#2d2d2d',
  sidebarBorder:        '#e5e5e5',
  sidebarRing:          '#b3b3b3',
  // Additional semantic tokens
  textPrimary:          '#101828',
  textSecondary:        '#717182',
  borderSubtle:         '#e5e7eb',
  surfaceSubtle:        '#f3f4f6',
  surfaceSubtleAlt:     '#f9fafb',
} as const;

export const dark = {
  background:           '#1a1a1f',
  foreground:           '#f9f9f9',
  card:                 '#1a1a1f',
  cardForeground:       '#f9f9f9',
  popover:              '#1a1a1f',
  popoverForeground:    '#f9f9f9',
  primary:              '#f9f9f9',
  primaryForeground:    '#2d2d2d',
  secondary:            '#3d3d3d',
  secondaryForeground:  '#f9f9f9',
  muted:                '#3d3d3d',
  mutedForeground:      '#b3b3b3',
  accent:               '#3d3d3d',
  accentForeground:     '#f9f9f9',
  destructive:          '#783025',
  destructiveForeground:'#e84040',
  border:               '#3d3d3d',
  input:                '#3d3d3d',
  inputBackground:      '#3d3d3d',
  switchBackground:     '#3d3d3d',
  ring:                 '#666666',
  // Charts
  chart1:               '#4a82f0',
  chart2:               '#1fbd65',
  chart3:               '#d4aa00',
  chart4:               '#b060f0',
  chart5:               '#e84040',
  // Sidebar
  sidebar:              '#2d2d2d',
  sidebarForeground:    '#f9f9f9',
  sidebarPrimary:       '#4a82f0',
  sidebarPrimaryForeground: '#f9f9f9',
  sidebarAccent:        '#3d3d3d',
  sidebarAccentForeground: '#f9f9f9',
  sidebarBorder:        '#3d3d3d',
  sidebarRing:          '#666666',
  // Additional semantic tokens
  textPrimary:          '#f9f9f9',
  textSecondary:        '#b3b3b3',
  borderSubtle:         '#3d3d3d',
  surfaceSubtle:        '#2d2d2d',
  surfaceSubtleAlt:     '#1a1a1f',
} as const;

export const brand = {
  primary:      '#155DFC',
  primaryLight: '#EEF3FF',
  primaryDark:  '#1D4ED8',
  chartLine:    '#155DFC',
  chartFill:    'rgba(21,93,252,0.15)',
  orange:       '#FF6900',
  orangeLight:  '#FFF7ED',
  success:        '#00a63e',
  successDark:    '#00bc7d',
  successLight:   '#dcfce7',
  successSurface: '#f0fdf4',
  successShadow:  '#10b981',
} as const;

export const semantic = {
  ai: {
    primary: '#4F46E5',
    background: '#F5F3FF',
    border: '#EDE9FE',
    borderLight: '#E0E7FF',
    bulletOrange: { bg: '#FFEDD5', icon: '#EA580C' },
    bulletGreen: { bg: '#DCFCE7', icon: '#16A34A' },
    bulletBlue: { bg: '#DBEAFE', icon: '#2563EB' },
  },
  category: {
    food: { color: '#F59E0B', bg: '#FEF3C7' },
    transport: { color: '#3B82F6', bg: '#DBEAFE' },
    shopping: { color: '#EC4899', bg: '#FCE7F3' },
    health: { color: '#EF4444', bg: '#FEE2E2' },
    entertainment: { color: '#8B5CF6', bg: '#EDE9FE' },
    utilities: { color: '#06B6D4', bg: '#CFFAFE' },
    rent: { color: '#10B981', bg: '#D1FAE5' },
    salary: { color: '#10B981', bg: '#D1FAE5' },
    freelance: { color: '#3B82F6', bg: '#DBEAFE' },
  }
} as const;

export const colors = light;
