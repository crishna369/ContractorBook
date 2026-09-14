import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type CardProps = ViewProps & {
  dark?: boolean;
};

export function Card({ style, dark, ...props }: CardProps) {
  return (
    <View
      style={[styles.card, dark ? styles.cardDark : styles.cardLight, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.cardPaddingLarge,
  },
  cardLight: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDark: {
    backgroundColor: colors.primaryDark,
  },
});
