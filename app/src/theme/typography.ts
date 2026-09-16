// Plus Jakarta Sans, per docs/design-handoff.md.
// Font family names match @expo-google-fonts/plus-jakarta-sans exports,
// loaded once at app startup via useFonts (see src/theme/useAppFonts.ts).

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const typography = {
  // Headers: 19-21px / 800
  header: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
  },
  headerLarge: {
    fontFamily: fontFamily.extraBold,
    fontSize: 21,
  },
  // Body: 15-16px / 600-700
  body: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  bodyStrong: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
  },
  // Labels / uppercase eyebrow: 12-13px / 700, letter-spacing 0.08-0.14em
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.14 * 12,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    letterSpacing: 0.08 * 13,
  },
  // Large money amounts, e.g. "Money in hand" card
  amountLarge: {
    fontFamily: fontFamily.extraBold,
    fontSize: 27,
    fontVariant: ['tabular-nums'] as Array<'tabular-nums'>,
  },
  amountXLarge: {
    fontFamily: fontFamily.extraBold,
    fontSize: 42,
    fontVariant: ['tabular-nums'] as Array<'tabular-nums'>,
  },
  amount: {
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    fontVariant: ['tabular-nums'] as Array<'tabular-nums'>,
  },
} as const;
