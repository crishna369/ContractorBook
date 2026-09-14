// Terracotta & charcoal theme — active. See docs/design-handoff.md for the
// original forest-green tokens (kept below, commented out, to switch back).
//
// ORIGINAL — Forest green theme:
// export const colors = {
//   // Backgrounds
//   bgPaper: '#F7F5F0',
//   bgCanvas: '#EDEAE3',
//
//   // Text
//   ink: '#1A1D1A',
//   textMutedA: '#7C837B',
//   textMutedB: '#A09A8C',
//   textMutedC: '#6E7770',
//
//   // Primary / brand
//   primaryDark: '#1F3B30', // buttons, selected states
//   accentGreen: '#2F7A55', // links, positive amounts
//   greenTintLight: '#E8F0EA', // secondary green surfaces
//   greenTintMid: '#9CC2B1', // text on dark
//   greenTintDark: '#8FB6A4', // text on dark
//
//   // Borders
//   border: '#E5E1D8',
//   borderStrong: '#DEDACF',
//
//   // Warning / negative
//   warningDark: '#B4571F',
//   warningLight: '#C07C1E',
//
//   // Neutral
//   chipBg: '#F0EDE6',
//
//   white: '#FFFFFF',
// } as const;

export const colors = {
  // Backgrounds
  bgPaper: '#FAF3EC',
  bgCanvas: '#F3E7DA',

  // Text
  ink: '#2B211C',
  textMutedA: '#8A7A70',
  textMutedB: '#A6968A',
  textMutedC: '#7A6B5D',

  // Primary / brand
  primaryDark: '#8A3B24', // buttons, selected states
  accentGreen: '#B4552F', // links, positive amounts
  greenTintLight: '#F4E2D8', // secondary tinted surfaces
  greenTintMid: '#E3BDA6', // text on dark
  greenTintDark: '#D8A98D', // text on dark

  // Borders
  border: '#EBDFD4',
  borderStrong: '#E3D5C6',

  // Warning / negative
  warningDark: '#A13C2B',
  warningLight: '#B36A1C',

  // Neutral
  chipBg: '#F0E6DA',

  white: '#FFFFFF',
} as const;

export type Colors = typeof colors;
