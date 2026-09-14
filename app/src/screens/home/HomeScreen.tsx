import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { useMe } from '../../api/hooks/useMe';
import { supabase } from '../../lib/supabase';

export function HomeScreen() {
  const { data: me, isLoading, error } = useMe();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {isLoading && <ActivityIndicator color={colors.primaryDark} />}

      {error && <Text style={styles.error}>Couldn't load your business: {String(error)}</Text>}

      {me && (
        <Card dark style={styles.card}>
          <Text style={styles.eyebrow}>Signed in</Text>
          <Text style={styles.businessName}>{me.business_name}</Text>
        </Card>
      )}

      <Text style={styles.signOut} onPress={() => supabase.auth.signOut()}>
        Sign out
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 60,
    gap: spacing.cardGap,
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
    marginBottom: 8,
  },
  card: {
    gap: 6,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.greenTintMid,
  },
  businessName: {
    ...typography.header,
    color: colors.white,
  },
  error: {
    ...typography.body,
    color: colors.warningDark,
  },
  signOut: {
    ...typography.body,
    color: colors.accentGreen,
    marginTop: 16,
  },
});
