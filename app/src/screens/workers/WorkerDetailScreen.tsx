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
import { useUpdateWorker, useWorker, useWorkerBalance, useWorkerReport } from '../../api/hooks/useWorkers';
import { useCreateAdditionalWork } from '../../api/hooks/useAdditionalWork';
import { usePayments } from '../../api/hooks/usePayments';
import { isValidMobileNumber, sanitizeMobileInput, sanitizeWholeNumberInput } from '../../utils/workerValidation';
import { formatDateLong, todayIsoDate } from '../../utils/attendance';
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from '../../utils/payment';
import type { WorkerPayment, WorkerSiteBreakdown } from '../../types/api';
import type { WorkersStackParamList } from '../../navigation/WorkersStack';

type Props = NativeStackScreenProps<WorkersStackParamList, 'WorkerDetail'>;

function AddAdditionalWorkForm({ workerId, onDone }: { workerId: string; onDone: () => void }) {
  const [date, setDate] = useState<string | null>(todayIsoDate());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const createAdditionalWork = useCreateAdditionalWork();

  const canSubmit = date !== null && Number(amount) > 0 && description.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || date === null) return;
    await createAdditionalWork.mutateAsync({
      worker_id: workerId,
      date,
      amount: Number(amount),
      description: description.trim(),
    });
    setAmount('');
    setDescription('');
    onDone();
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.formTitle}>Add extra work</Text>
      <DateField label="Date" value={date} onChange={setDate} clearable={false} />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor={colors.textMutedA}
        keyboardType="number-pad"
        value={amount}
        onChangeText={(text) => setAmount(sanitizeWholeNumberInput(text))}
      />
      <TextInput
        style={styles.input}
        placeholder="What was it for"
        placeholderTextColor={colors.textMutedA}
        value={description}
        onChangeText={setDescription}
      />
      <PrimaryButton
        label="Save extra work"
        onPress={handleSubmit}
        loading={createAdditionalWork.isPending}
        disabled={!canSubmit}
      />
    </Card>
  );
}

function SiteBreakdownRow({ site }: { site: WorkerSiteBreakdown }) {
  return (
    <Card style={styles.siteBreakdownRow}>
      <Text style={styles.siteBreakdownName}>{site.site_name}</Text>
      <View style={styles.siteBreakdownRight}>
        <Text style={styles.siteBreakdownDays}>{Number(site.days_worked)} day</Text>
        <Text style={styles.siteBreakdownEarnings}>₹{Math.round(Number(site.earnings))}</Text>
      </View>
    </Card>
  );
}

function PaymentRow({ payment }: { payment: WorkerPayment }) {
  return (
    <Card style={styles.paymentRow}>
      <View style={styles.paymentRowTop}>
        <Text style={styles.paymentDate}>{formatDateLong(payment.date)}</Text>
        <Text style={styles.paymentAmount}>₹{Math.round(Number(payment.amount))}</Text>
      </View>
      <Text style={styles.paymentMeta}>
        {PAYMENT_TYPE_LABELS[payment.payment_type]} · {PAYMENT_METHOD_LABELS[payment.payment_method]}
        {payment.reason ? ` · ${payment.reason}` : ''}
      </Text>
    </Card>
  );
}

export function WorkerDetailScreen({ route, navigation }: Props) {
  const { workerId } = route.params;
  const { data: worker, isLoading, error } = useWorker(workerId);
  const { data: balance } = useWorkerBalance(workerId);
  const { data: payments, isLoading: paymentsLoading } = usePayments(workerId);
  const { data: report } = useWorkerReport(workerId);
  const updateWorker = useUpdateWorker(workerId);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showAddWorkForm, setShowAddWorkForm] = useState(false);

  useEffect(() => {
    if (worker) {
      setName(worker.name);
      setMobileNumber(worker.mobile_number ?? '');
      setDailyWage(String(Math.round(Number(worker.daily_wage))));
      setIsActive(worker.is_active);
    }
  }, [worker]);

  const hasChanges =
    worker !== undefined &&
    (name.trim() !== worker.name ||
      mobileNumber !== (worker.mobile_number ?? '') ||
      dailyWage !== String(Math.round(Number(worker.daily_wage))) ||
      isActive !== worker.is_active);
  const canSave =
    hasChanges && name.trim().length > 0 && isValidMobileNumber(mobileNumber) && Number(dailyWage) > 0;

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (worker) {
      setName(worker.name);
      setMobileNumber(worker.mobile_number ?? '');
      setDailyWage(String(Math.round(Number(worker.daily_wage))));
      setIsActive(worker.is_active);
    }
    setIsEditing(false);
  }

  async function handleSave() {
    if (!canSave) return;
    await updateWorker.mutateAsync({
      name: name.trim(),
      mobile_number: mobileNumber.length > 0 ? mobileNumber : null,
      daily_wage: Number(dailyWage),
      is_active: isActive,
    });
    setIsEditing(false);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  if (error || !worker) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Couldn't load this worker.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Back to Workers</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const balancePayable = balance ? Number(balance.balance_payable) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Workers</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isEditing && (
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.title}>{worker.name}</Text>
              <Text style={styles.summaryMeta}>
                {worker.is_active ? 'Active' : 'Inactive'} · ₹{Math.round(Number(worker.daily_wage))}/day
                {worker.mobile_number ? ` · ${worker.mobile_number}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {isEditing && (
          <>
            <Text style={styles.title}>Worker details</Text>

            <Card style={styles.card}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Worker name" />

              <Text style={styles.label}>Mobile number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={(text) => setMobileNumber(sanitizeMobileInput(text))}
                placeholder="Mobile number (optional)"
                keyboardType="number-pad"
                maxLength={10}
              />

              <Text style={styles.label}>Daily wage</Text>
              <TextInput
                style={styles.input}
                value={dailyWage}
                onChangeText={(text) => setDailyWage(sanitizeWholeNumberInput(text))}
                placeholder="Daily wage"
                keyboardType="number-pad"
              />

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

              <Text style={styles.meta}>Added {new Date(worker.created_at).toLocaleDateString()}</Text>
            </Card>

            <View style={styles.editActionsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonLabel}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Save changes"
                onPress={handleSave}
                loading={updateWorker.isPending}
                disabled={!canSave}
                style={styles.saveButton}
              />
            </View>
          </>
        )}

        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance payable</Text>
          <Text style={[styles.balanceValue, balancePayable > 0 && styles.balanceValueDue]}>
            ₹{Math.round(balancePayable)}
          </Text>
          <PrimaryButton
            label="Pay worker"
            onPress={() => navigation.navigate('PayWorker', { workerId })}
            style={styles.payButton}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment history</Text>
        </View>
        {paymentsLoading && <ActivityIndicator color={colors.primaryDark} />}
        {!paymentsLoading && (
          <View style={styles.sectionList}>
            {(payments ?? []).map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
            {payments && payments.length === 0 && <EmptyState label="No payments yet" />}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Additional work</Text>
          <TouchableOpacity onPress={() => setShowAddWorkForm((v) => !v)}>
            <Text style={styles.addLink}>{showAddWorkForm ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>
        {showAddWorkForm && (
          <AddAdditionalWorkForm workerId={workerId} onDone={() => setShowAddWorkForm(false)} />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Earnings by site (all-time)</Text>
        </View>
        {report && (
          <View style={styles.sectionList}>
            {report.sites.map((site) => (
              <SiteBreakdownRow key={site.site_id} site={site} />
            ))}
            {report.sites.length === 0 && <EmptyState label="No attendance recorded yet" />}
            <Card style={styles.reportSummaryCard}>
              <View style={styles.reportSummaryRow}>
                <Text style={styles.reportSummaryLabel}>Additional work</Text>
                <Text style={styles.reportSummaryValue}>₹{Math.round(Number(report.additional_work_earnings))}</Text>
              </View>
              <View style={[styles.reportSummaryRow, styles.reportSummaryRowLast]}>
                <Text style={styles.reportSummaryLabelStrong}>Total earned</Text>
                <Text style={styles.reportSummaryValueStrong}>₹{Math.round(Number(report.total_earned))}</Text>
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
  balanceCard: {
    gap: 10,
  },
  balanceLabel: {
    ...typography.label,
    color: colors.textMutedA,
    textTransform: 'uppercase',
  },
  balanceValue: {
    ...typography.amountLarge,
    color: colors.ink,
  },
  balanceValueDue: {
    color: colors.warningDark,
  },
  payButton: {
    marginTop: 4,
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
  form: {
    gap: 10,
  },
  formTitle: {
    ...typography.bodyStrong,
    color: colors.ink,
    marginBottom: 4,
  },
  sectionList: {
    gap: 10,
  },
  paymentRow: {
    padding: spacing.cardPaddingSmall,
    gap: 4,
  },
  paymentRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  paymentAmount: {
    ...typography.amount,
    color: colors.ink,
  },
  paymentMeta: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
  siteBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.cardPaddingSmall,
  },
  siteBreakdownName: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
    flex: 1,
  },
  siteBreakdownRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  siteBreakdownDays: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textMutedA,
  },
  siteBreakdownEarnings: {
    ...typography.amount,
    color: colors.ink,
  },
  reportSummaryCard: {
    gap: 4,
  },
  reportSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reportSummaryRowLast: {
    borderTopWidth: 1,
    borderTopColor: colors.chipBg,
    marginTop: 4,
    paddingTop: 10,
  },
  reportSummaryLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textMutedA,
  },
  reportSummaryValue: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  reportSummaryLabelStrong: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  reportSummaryValueStrong: {
    ...typography.amount,
    fontSize: 18,
    color: colors.ink,
  },
});
