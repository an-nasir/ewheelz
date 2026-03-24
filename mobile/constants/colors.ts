// constants/colors.ts — eWheelz design tokens (mirrors web theme)

export const Colors = {
  // Brand
  primary:      "#6366F1", // indigo-500
  primaryDark:  "#4F46E5", // indigo-600
  primaryLight: "#EEF2FF", // indigo-50
  green:        "#22C55E", // green-500
  greenDark:    "#16A34A", // green-600
  greenLight:   "#F0FDF4", // green-50

  // Backgrounds
  bg:           "#F6F8FF", // page background
  white:        "#FFFFFF",
  card:         "#FFFFFF",

  // Text
  text:         "#0F172A", // slate-900
  textMuted:    "#475569", // slate-600
  textLight:    "#94A3B8", // slate-400
  textInverted: "#FFFFFF",

  // Borders
  border:       "#E6E9F2",
  borderStrong: "#C7D2FE", // indigo-200

  // Status
  amber:        "#F59E0B",
  amberLight:   "#FFFBEB",
  red:          "#EF4444",
  redLight:     "#FEF2F2",

  // Gradients (start/end pairs)
  gradientHero:   ["#6366F1", "#4F46E5", "#7C3AED"] as string[],
  gradientGreen:  ["#22C55E", "#10B981", "#3B82F6"] as string[],
  gradientCard:   ["#FFFFFF", "#F6F8FF"] as string[],
} as const;
