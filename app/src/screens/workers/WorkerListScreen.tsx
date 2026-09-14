import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { useCreateWorker, useWorkers } from '../../api/hooks/useWorkers';
import type { Worker } from '../../types/api';

function WorkerRow({ worker }: { worker: Worker }) {
  return (
    <Card style={styles.row}>
      <Avatar name={worker.name} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{worker.name}</Text>
        <Text style={styles.rowMeta}>
          {worker.mobile_number} · ₹{worker.daily_wage}/day
        </Text>
      </View>
    </Card>
  );
}

function AddWorkerForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const createWorker = useCreateWorker();

  const canSubmit = name.trim().length > 0 && mobileNumber.trim().length > 0 && Number(dailyWage) > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    await createWorker.mutateAsync({
      name: name.trim(),
      mobile_number: mobileNumber.trim(),
      daily_wage: Number(dailyWage),
    });
    setName('');
    setMobileNumber('');
    setDailyWage('');
    onDone();
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.formTitle}>Add worker</Text>
      <TextInput style={styles.input} placeholder="Name" placeholderTextColor={colors.textMutedA} value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Mobile number"
        placeholderTextColor={colors.textMutedA}
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Daily wage"
        placeholderTextColor={colors.textMutedA}
        keyboardType="numeric"
        value={dailyWage}
        onChangeText={setDailyWage}
      />
      <PrimaryButton label="Save worker" onPress={handleSubmit} loading={createWorker.isPending} disabled={!canSubmit} />
    </Card>
  );
}

export function WorkerListScreen() {
  const { data: workers, isLoading, error } = useWorkers();
  const [showForm, setShowForm] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workers</Text>
        <TouchableOpacity onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.addLink}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && <AddWorkerForm onDone={() => setShowForm(false)} />}

      {isLoading && <ActivityIndicator color={colors.primaryDark} />}
      {error && <Text style={styles.error}>Couldn't load workers: {String(error)}</Text>}

      <FlatList
        data={workers}
        keyExtractor={(w) => w.id}
        renderItem={({ item }) => <WorkerRow worker={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.cardGap }} />}
        ListEmptyComponent={!isLoading ? <EmptyState label="No workers yet" /> : null}
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
    gap: 12,
    padding: spacing.cardPaddingSmall,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  rowMeta: {
    ...typography.label,
    color: colors.textMutedA,
    marginTop: 2,
    textTransform: 'none',
    letterSpacing: 0,
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
