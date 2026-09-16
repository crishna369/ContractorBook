import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DateField } from '../../components/DateField';
import { EmptyState } from '../../components/EmptyState';
import { useSite, useSiteReport, useUpdateSite } from '../../api/hooks/useSites';
import { useExpenses } from '../../api/hooks/useExpenses';
import { useBills } from '../../api/hooks/useBilling';
import { formatDateLong } from '../../utils/attendance';
import { PAID_BY_LABELS } from '../../utils/expense';
import { PAYMENT_METHOD_LABELS } from '../../utils/payment';
import type { ClientBill, SiteExpense, SiteWorkerBreakdown } from '../../types/api';
import type { SitesStackParamList } from '../../navigation/SitesStack';

type Props = NativeStackScreenProps<SitesStackParamList, 'SiteDetail'>;

function ExpenseRow({ expense }: { expense: SiteExpense }) {
  return (
    <Card style={styles.expenseRow}>
      <View style={styles.expenseRowTop}>
        <Text style={styles.expenseDescription}>{expense.description}</Text>
        <Text style={styles.expenseAmount}>₹{Math.round(Number(expense.amount))}</Text>
      </View>
      <Text style={styles.expenseMeta}>
        {formatDateLong(expense.date)} · {PAID_BY_LABELS[expense.paid_by]} · {PAYMENT_METHOD_LABELS[expense.payment_method]}
      </Text>
    </Card>
  );
}

function BillRow({ bill, onPress }: { bill: ClientBill; onPress: () => void }) {
  const balance = Number(bill.balance);
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.expenseRow}>
        <View style={styles.expenseRowTop}>
          <Text style={styles.expenseDescription}>₹{Math.round(Number(bill.bill_amount))} bill</Text>
          <View style={[styles.balanceChip, balance <= 0 && styles.balanceChipClear]}>
            <Text style={[styles.balanceChipLabel, balance <= 0 && styles.balanceChipLabelClear]}>
              {balance > 0 ? `₹${Math.round(balance)} due` : 'Settled'}
            </Text>
          </View>
        </View>
        <Text style={styles.expenseMeta}>{formatDateLong(bill.bill_date)}</Text>
      </Card>
    </TouchableOpacity>
  );
}

function WorkerBreakdownRow({ worker }: { worker: SiteWorkerBreakdown }) {
  return (
    <Card style={styles.expenseRow}>
      <View style={styles.expenseRowTop}>
        <Text style={styles.expenseDescription}>{worker.worker_name}</Text>
        <Text style={styles.expenseAmount}>₹{Math.round(Number(worker.labour_cost))}</Text>
      </View>
      <Text style={styles.expenseMeta}>{Number(worker.days_worked)} day worked</Text>
    </Card>
  );
}

export function SiteDetailScreen({ route, navigation }: Props) {
  const { siteId } = route.params;
  const { data: site, isLoading, error } = useSite(siteId);
  const { data: expenses, isLoading: expensesLoading } = useExpenses(siteId);
  const { data: bills, isLoading: billsLoading } = useBills(siteId);
  const { data: report } = useSiteReport(siteId);
  const updateSite = useUpdateSite(siteId);

  const [isEditing, setIsEditing] = useState(false);
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

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (site) {
      setName(site.name);
      setStartDate(site.start_date);
      setIsActive(site.is_active);
    }
    setIsEditing(false);
  }

  async function handleSave() {
    if (!canSave) return;
    await updateSite.mutateAsync({ name: name.trim(), start_date: startDate, is_active: isActive });
    setIsEditing(false);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isEditing && (
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.title}>{site.name}</Text>
              <Text style={styles.summaryMeta}>
                {site.is_active ? 'Active' : 'Inactive'}
                {site.start_date ? ` · Started ${formatDateLong(site.start_date)}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {isEditing && (
          <>
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

            <View style={styles.editActionsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonLabel}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Save changes"
                onPress={handleSave}
                loading={updateSite.isPending}
                disabled={!canSave}
                style={styles.saveButton}
              />
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Client bills</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddBill', { siteId })}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {billsLoading && <ActivityIndicator color={colors.primaryDark} />}
        {!billsLoading && (
          <View style={styles.sectionList}>
            {(bills ?? []).map((bill) => (
              <BillRow key={bill.id} bill={bill} onPress={() => navigation.navigate('BillDetail', { billId: bill.id })} />
            ))}
            {bills && bills.length === 0 && <EmptyState label="No bills yet" />}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SiteExpense', { siteId })}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {expensesLoading && <ActivityIndicator color={colors.primaryDark} />}
        {!expensesLoading && (
          <View style={styles.sectionList}>
            {(expenses ?? []).map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
            {expenses && expenses.length === 0 && <EmptyState label="No expenses yet" />}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Labour cost by worker (all-time)</Text>
        </View>
        {report && (
          <View style={styles.sectionList}>
            {report.workers.map((worker) => (
              <WorkerBreakdownRow key={worker.worker_id} worker={worker} />
            ))}
            {report.workers.length === 0 && <EmptyState label="No attendance recorded yet" />}
            <Card style={styles.positionCard}>
              <View style={styles.positionRow}>
                <Text style={styles.positionLabel}>Received</Text>
                <Text style={styles.positionValue}>₹{Math.round(Number(report.received_total))}</Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={styles.positionLabel}>Labour cost</Text>
                <Text style={styles.positionValue}>− ₹{Math.round(Number(report.labour_cost_total))}</Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={styles.positionLabel}>Expenses</Text>
                <Text style={styles.positionValue}>− ₹{Math.round(Number(report.expenses_total))}</Text>
              </View>
              <View style={[styles.positionRow, styles.positionRowLast]}>
                <Text style={styles.positionLabelStrong}>Position</Text>
                <Text
                  style={[styles.positionValueStrong, Number(report.position) < 0 && styles.positionValueNegative]}
                >
                  ₹{Math.round(Number(report.position))}
                </Text>
              </View>
            </Card>
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
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: 40,
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
    paddingHorizontal: spacing.screenPaddingHorizontal,
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  summaryMeta: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textMutedA,
    marginTop: 4,
  },
  editLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
    marginTop: 4,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  cancelButton: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textMutedA,
  },
  saveButton: {
    flex: 2,
    width: 'auto',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
  },
  addLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
  },
  sectionList: {
    gap: 10,
  },
  expenseRow: {
    padding: spacing.cardPaddingSmall,
    gap: 4,
  },
  expenseRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseDescription: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    ...typography.amount,
    color: colors.ink,
  },
  expenseMeta: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
  balanceChip: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  balanceChipClear: {
    backgroundColor: colors.chipBg,
  },
  balanceChipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.warningDark,
  },
  balanceChipLabelClear: {
    color: colors.textMutedA,
  },
  positionCard: {
    gap: 4,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  positionRowLast: {
    borderTopWidth: 1,
    borderTopColor: colors.chipBg,
    marginTop: 4,
    paddingTop: 10,
  },
  positionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textMutedA,
  },
  positionValue: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  positionLabelStrong: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  positionValueStrong: {
    ...typography.amount,
    fontSize: 18,
    color: colors.accentGreen,
  },
  positionValueNegative: {
    color: colors.warningDark,
  },
});
