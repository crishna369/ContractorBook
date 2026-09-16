import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DateField } from '../../components/DateField';
import { useLedgerBalances, useSetOpeningBalance } from '../../api/hooks/useLedger';
import { sanitizeWholeNumberInput } from '../../utils/workerValidation';
import { todayIsoDate } from '../../utils/attendance';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type Props = NativeStackScreenProps<HomeStackParamList, 'SetOpeningBalance'>;

export function SetOpeningBalanceScreen({ navigation }: Props) {
  const { data: balances } = useLedgerBalances();
  const setOpeningBalance = useSetOpeningBalance();

  const [openingCash, setOpeningCash] = useState('');
  const [openingBank, setOpeningBank] = useState('');
  const [asOfDate, setAsOfDate] = useState<string | null>(todayIsoDate());

  useEffect(() => {
    if (balances) {
      setOpeningCash(String(Math.round(Number(balances.cash.opening))));
      setOpeningBank(String(Math.round(Number(balances.bank.opening))));
      if (balances.as_of_date) setAsOfDate(balances.as_of_date);
    }
  }, [balances]);

  const canSave = asOfDate !== null && openingCash.length > 0 && openingBank.length > 0;

  async function handleSave() {
    if (!canSave || asOfDate === null) return;
    await setOpeningBalance.mutateAsync({
      opening_cash: Number(openingCash),
      opening_bank: Number(openingBank),
      as_of_date: asOfDate,
    });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Opening balance</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Set the cash and bank amount you had on a given date. Balances shown everywhere are computed from this
          plus every payment, receipt, and expense recorded since.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.label}>Opening cash</Text>
          <TextInput
            style={styles.input}
            value={openingCash}
            onChangeText={(text) => setOpeningCash(sanitizeWholeNumberInput(text))}
            placeholder="0"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Opening bank & UPI</Text>
          <TextInput
            style={styles.input}
            value={openingBank}
            onChangeText={(text) => setOpeningBank(sanitizeWholeNumberInput(text))}
            placeholder="0"
            keyboardType="number-pad"
          />

          <DateField label="As of date" value={asOfDate} onChange={setAsOfDate} clearable={false} />
        </Card>

        <PrimaryButton
          label="Save opening balance"
          onPress={handleSave}
          loading={setOpeningBalance.isPending}
          disabled={!canSave}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  cancelLink: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textMutedB,
  },
  hint: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textMutedA,
    lineHeight: 19,
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
    marginBottom: 4,
  },
});
