import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { useCreateWorker, useWorkers } from '../../api/hooks/useWorkers';
import { isValidMobileNumber, sanitizeMobileInput, sanitizeWholeNumberInput } from '../../utils/workerValidation';
import type { Worker } from '../../types/api';
import type { WorkersStackParamList } from '../../navigation/WorkersStack';

type NavProp = NativeStackNavigationProp<WorkersStackParamList, 'WorkerList'>;

function WorkerRow({ worker, onPress }: { worker: Worker; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.row}>
        <Avatar name={worker.name} />
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{worker.name}</Text>
          <Text style={styles.rowMeta}>
            {worker.mobile_number ? `${worker.mobile_number} · ` : ''}₹{worker.daily_wage}/day
          </Text>
          {!worker.is_active && <Text style={styles.inactiveTag}>Inactive</Text>}
        </View>
        <Text style={styles.chevron}>›</Text>
      </Card>
    </TouchableOpacity>
  );
}

function AddWorkerForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const createWorker = useCreateWorker();

  const canSubmit = name.trim().length > 0 && isValidMobileNumber(mobileNumber) && Number(dailyWage) > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    await createWorker.mutateAsync({
      name: name.trim(),
      mobile_number: mobileNumber.length > 0 ? mobileNumber : null,
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
        placeholder="Mobile number (optional)"
        placeholderTextColor={colors.textMutedA}
        keyboardType="number-pad"
        maxLength={10}
        value={mobileNumber}
        onChangeText={(text) => setMobileNumber(sanitizeMobileInput(text))}
      />
      <TextInput
        style={styles.input}
        placeholder="Daily wage"
        placeholderTextColor={colors.textMutedA}
        keyboardType="number-pad"
        value={dailyWage}
        onChangeText={(text) => setDailyWage(sanitizeWholeNumberInput(text))}
      />
      <PrimaryButton label="Save worker" onPress={handleSubmit} loading={createWorker.isPending} disabled={!canSubmit} />
    </Card>
  );
}

export function WorkerListScreen() {
  const navigation = useNavigation<NavProp>();
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
        renderItem={({ item }) => (
          <WorkerRow worker={item} onPress={() => navigation.navigate('WorkerDetail', { workerId: item.id })} />
        )}
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
  inactiveTag: {
    ...typography.label,
    color: colors.warningLight,
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 2,
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
