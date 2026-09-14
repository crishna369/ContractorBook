// Spacing & radius tokens, per docs/design-handoff.md.

export const radius = {
  card: 20,
  cardSmall: 18,
  tile: 16,
  tileSmall: 14,
  pill: 999,
} as const;

export const spacing = {
  screenPaddingHorizontal: 20,
  cardPaddingSmall: 14,
  cardPaddingLarge: 20,
  cardGap: 12, // between stacked cards (10-14px range)
} as const;
