import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DateField } from '../../components/DateField';
import { useSite, useUpdateSite } from '../../api/hooks/useSites';
import type { SitesStackParamList } from '../../navigation/SitesStack';

type Props = NativeStackScreenProps<SitesStackParamList, 'SiteDetail'>;

export function SiteDetailScreen({ route, navigation }: Props) {
  const { siteId } = route.params;
  const { data: site, isLoading, error } = useSite(siteId);
  const updateSite = useUpdateSite(siteId);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (site) {
      setName(site.name);
      setStartDate(site.start_date);
      setIsActive(site.is_active);
    }
  }, [site]);

  const hasChanges =
    site !== undefined &&
    (name.trim() !== site.name || startDate !== site.start_date || isActive !== site.is_active);
  const canSave = hasChanges && name.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    await updateSite.mutateAsync({ name: name.trim(), start_date: startDate, is_active: isActive });
    navigation.goBack();
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  if (error || !site) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Couldn't load this site.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Back to Sites</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Sites</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Site details</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Site name" />

        <DateField label="Start date" value={startDate} onChange={setStartDate} placeholder="Not set" />

        <Text style={styles.label}>Status</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.togglePill, isActive && styles.togglePillActive]}
            onPress={() => setIsActive(true)}
          >
            <Text style={[styles.toggleLabel, isActive && styles.toggleLabelActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.togglePill, !isActive && styles.togglePillActive]}
            onPress={() => setIsActive(false)}
          >
            <Text style={[styles.toggleLabel, !isActive && styles.toggleLabelActive]}>Inactive</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.meta}>Added {new Date(site.created_at).toLocaleDateString()}</Text>
      </Card>

      <PrimaryButton label="Save changes" onPress={handleSave} loading={updateSite.isPending} disabled={!canSave} />
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
  centered: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  backLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  card: {
    gap: 10,
  },
  label: {
    ...typography.label,
    color: colors.textMutedA,
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.tileSmall,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  togglePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
  },
  togglePillActive: {
    backgroundColor: colors.primaryDark,
  },
  toggleLabel: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  toggleLabelActive: {
    color: colors.white,
  },
  meta: {
    ...typography.body,
    color: colors.textMutedA,
    marginTop: 4,
  },
  error: {
    ...typography.body,
    color: colors.warningDark,
  },
});
