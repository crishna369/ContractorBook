import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useLedgerBalances, useLedgerTransactions } from '../../api/hooks/useLedger';
import { formatDateLong } from '../../utils/attendance';
import { PAYMENT_METHOD_LABELS } from '../../utils/payment';
import type { LedgerTransaction, MethodBalance } from '../../types/api';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type Props = NativeStackScreenProps<HomeStackParamList, 'CashBankLedger'>;

type MethodFilter = 'all' | 'cash' | 'bank';

function rupees(value: number): string {
  return Math.round(value).toLocaleString('en-IN');
}

function MethodCard({ label, data }: { label: string; data: MethodBalance }) {
  return (
    <Card style={styles.methodCard}>
      <Text style={styles.methodLabel}>{label}</Text>
      <Text style={styles.methodBalance}>₹{rupees(Number(data.balance))}</Text>
      <View style={styles.methodDetailRow}>
        <Text style={styles.methodDetail}>In ₹{rupees(Number(data.money_in))}</Text>
        <Text style={styles.methodDetail}>Out ₹{rupees(Number(data.money_out))}</Text>
      </View>
    </Card>
  );
}

function TransactionRow({ transaction }: { transaction: LedgerTransaction }) {
  const isIn = transaction.direction === 'in';
  return (
    <Card style={styles.txRow}>
      <View style={styles.txTop}>
        <Text style={styles.txLabel} numberOfLines={1}>
          {transaction.label}
        </Text>
        <Text style={[styles.txAmount, isIn ? styles.txAmountIn : styles.txAmountOut]}>
          {isIn ? '+' : '−'}₹{rupees(Number(transaction.amount))}
        </Text>
      </View>
      <Text style={styles.txMeta}>
        {formatDateLong(transaction.date)} · {PAYMENT_METHOD_LABELS[transaction.payment_method]}
      </Text>
    </Card>
  );
}

export function CashBankLedgerScreen({ navigation }: Props) {
  const { data: balances, isLoading: balancesLoading } = useLedgerBalances();
  const [filter, setFilter] = useState<MethodFilter>('all');
  const { data: transactions, isLoading: transactionsLoading } = useLedgerTransactions(
    filter === 'all' ? undefined : filter
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Home</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Cash & Bank</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SetOpeningBalance')}>
            <Text style={styles.openingLink}>Opening balance</Text>
          </TouchableOpacity>
        </View>

        {balancesLoading && <ActivityIndicator color={colors.primaryDark} />}
        {balances && (
          <>
            <View style={styles.methodRow}>
              <MethodCard label="Cash" data={balances.cash} />
              <MethodCard label="Bank & UPI" data={balances.bank} />
            </View>
            {balances.as_of_date && (
              <Text style={styles.asOfText}>Opening balance set as of {formatDateLong(balances.as_of_date)}</Text>
            )}
          </>
        )}

        <View style={styles.filterRow}>
          {(['all', 'cash', 'bank'] as MethodFilter[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.filterPill, filter === m && styles.filterPillActive]}
              onPress={() => setFilter(m)}
            >
              <Text style={[styles.filterLabel, filter === m && styles.filterLabelActive]}>
                {m === 'all' ? 'All' : m === 'cash' ? 'Cash' : 'Bank'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {transactionsLoading && <ActivityIndicator color={colors.primaryDark} />}
        {!transactionsLoading && (
          <View style={styles.sectionList}>
            {(transactions ?? []).map((t) => (
              <TransactionRow key={`${t.type}-${t.id}`} transaction={t} />
            ))}
            {transactions && transactions.length === 0 && <EmptyState label="No transactions yet" />}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: 4,
  },
  backLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: 40,
    gap: spacing.cardGap,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  openingLink: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.accentGreen,
  },
  methodRow: {
    flexDirection: 'row',
    gap: spacing.cardGap,
  },
  methodCard: {
    flex: 1,
    gap: 4,
  },
  methodLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
  methodBalance: {
    ...typography.amountLarge,
    fontSize: 22,
    color: colors.ink,
  },
  methodDetailRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  methodDetail: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textMutedB,
  },
  asOfText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textMutedB,
    marginTop: -4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBg,
  },
  filterPillActive: {
    backgroundColor: colors.primaryDark,
  },
  filterLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.ink,
  },
  filterLabelActive: {
    color: colors.white,
  },
  sectionList: {
    gap: 10,
  },
  txRow: {
    padding: spacing.cardPaddingSmall,
    gap: 4,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  txLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
    flex: 1,
  },
  txAmount: {
    ...typography.amount,
  },
  txAmountIn: {
    color: colors.accentGreen,
  },
  txAmountOut: {
    color: colors.warningDark,
  },
  txMeta: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
});
