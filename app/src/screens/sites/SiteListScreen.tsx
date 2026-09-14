import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { DateField } from '../../components/DateField';
import { useCreateSite, useSites } from '../../api/hooks/useSites';
import type { Site } from '../../types/api';
import type { SitesStackParamList } from '../../navigation/SitesStack';

type NavProp = NativeStackNavigationProp<SitesStackParamList, 'SiteList'>;

function SiteRow({ site, onPress }: { site: Site; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{site.name}</Text>
          {!site.is_active && <Text style={styles.inactiveTag}>Inactive</Text>}
        </View>
        <Text style={styles.chevron}>›</Text>
      </Card>
    </TouchableOpacity>
  );
}

function AddSiteForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const createSite = useCreateSite();
  const canSubmit = name.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    await createSite.mutateAsync({ name: name.trim(), start_date: startDate });
    setName('');
    setStartDate(null);
    onDone();
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.formTitle}>Add site</Text>
      <TextInput style={styles.input} placeholder="Site name" placeholderTextColor={colors.textMutedA} value={name} onChangeText={setName} />
      <DateField label="Start date" value={startDate} onChange={setStartDate} placeholder="Optional" />
      <PrimaryButton label="Save site" onPress={handleSubmit} loading={createSite.isPending} disabled={!canSubmit} />
    </Card>
  );
}

export function SiteListScreen() {
  const navigation = useNavigation<NavProp>();
  const { data: sites, isLoading, error } = useSites();
  const [showForm, setShowForm] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sites</Text>
        <TouchableOpacity onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.addLink}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && <AddSiteForm onDone={() => setShowForm(false)} />}

      {isLoading && <ActivityIndicator color={colors.primaryDark} />}
      {error && <Text style={styles.error}>Couldn't load sites: {String(error)}</Text>}

      <FlatList
        data={sites}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <SiteRow site={item} onPress={() => navigation.navigate('SiteDetail', { siteId: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.cardGap }} />}
        ListEmptyComponent={!isLoading ? <EmptyState label="No sites yet" /> : null}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.cardGap,
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  addLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.cardPaddingSmall,
  },
  rowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowName: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  inactiveTag: {
    ...typography.label,
    color: colors.warningLight,
    textTransform: 'none',
    letterSpacing: 0,
  },
  chevron: {
    ...typography.headerLarge,
    color: colors.textMutedB,
  },
  form: {
    gap: 10,
    marginBottom: spacing.cardGap,
  },
  formTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
    marginBottom: 4,
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
  },
  error: {
    ...typography.body,
    color: colors.warningDark,
  },
});
