import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SitePickerModal } from '../../components/SitePickerModal';
import { useWorker, useWorkerBalance } from '../../api/hooks/useWorkers';
import { useSites } from '../../api/hooks/useSites';
import { useCreatePayment } from '../../api/hooks/usePayments';
import { useLedgerBalances } from '../../api/hooks/useLedger';
import { sanitizeWholeNumberInput } from '../../utils/workerValidation';
import { formatDateLong, toIsoDate, todayIsoDate } from '../../utils/attendance';
import type { PaymentMethod, PaymentType } from '../../types/api';
import type { WorkersStackParamList } from '../../navigation/WorkersStack';

type Props = NativeStackScreenProps<WorkersStackParamList, 'PayWorker'>;

const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string; sub: string }[] = [
  { value: 'advance', label: 'Advance', sub: 'weekly' },
  { value: 'salary', label: 'Salary', sub: 'part or full' },
  { value: 'extra_work', label: 'Extra work', sub: 'separate' },
];

const QUICK_AMOUNTS = [1000, 2000, 5000];

export function PayWorkerScreen({ route, navigation }: Props) {
  const { workerId } = route.params;
  const { data: worker, isLoading: workerLoading } = useWorker(workerId);
  const { data: balance, isLoading: balanceLoading } = useWorkerBalance(workerId);
  const { data: sites } = useSites();
  const { data: ledgerBalances } = useLedgerBalances();
  const createPayment = useCreatePayment();

  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('advance');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(todayIsoDate());
  const [reason, setReason] = useState('');
  const [showSitePicker, setShowSitePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const balancePayable = balance ? Number(balance.balance_payable) : 0;
  const amountNumber = Number(amount) || 0;
  const balanceAfter = balancePayable - amountNumber;
  const site = siteId ? (sites ?? []).find((s) => s.id === siteId) : undefined;

  const canSave = amountNumber > 0 && date !== null;

  async function handleSave() {
    if (!canSave || date === null) return;
    await createPayment.mutateAsync({
      worker_id: workerId,
      site_id: siteId,
      date,
      amount: amountNumber,
      payment_type: paymentType,
      reason: reason.trim().length > 0 ? reason.trim() : null,
      payment_method: paymentMethod,
    });
    navigation.goBack();
  }

  const loading = workerLoading || balanceLoading;

  if (loading || !worker) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ {worker.name}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pay worker</Text>

        <Card style={styles.workerCard}>
          <Avatar name={worker.name} size={46} />
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>{worker.name}</Text>
            <Text style={styles.workerMeta}>
              Balance payable{' '}
              <Text style={balancePayable > 0 ? styles.balanceDue : styles.balanceClear}>
                ₹{Math.round(balancePayable)}
              </Text>
            </Text>
          </View>
        </Card>

        <Card dark style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(sanitizeWholeNumberInput(text))}
              placeholder="0"
              placeholderTextColor={colors.greenTintMid}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.quickAmountRow}>
            {QUICK_AMOUNTS.map((qa) => (
              <TouchableOpacity key={qa} style={styles.quickAmountPill} onPress={() => setAmount(String(qa))}>
                <Text style={styles.quickAmountLabel}>₹{qa.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            ))}
            {balancePayable > 0 && (
              <TouchableOpacity
                style={styles.quickAmountPill}
                onPress={() => setAmount(String(Math.round(balancePayable)))}
              >
                <Text style={styles.quickAmountLabel}>Full ₹{Math.round(balancePayable).toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <View style={styles.selectorSection}>
          <Text style={styles.selectorLabel}>This money is</Text>
          <View style={styles.paymentTypeRow}>
            {PAYMENT_TYPE_OPTIONS.map((option) => {
              const selected = paymentType === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.paymentTypeCell, selected && styles.paymentTypeCellSelected]}
                  onPress={() => setPaymentType(option.value)}
                >
                  <Text style={[styles.paymentTypeLabel, selected && styles.paymentTypeLabelSelected]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.paymentTypeSub, selected && styles.paymentTypeSubSelected]}>{option.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.selectorSection}>
          <Text style={styles.selectorLabel}>Paid from</Text>
          <View style={styles.paidFromRow}>
            <TouchableOpacity
              style={[styles.paidFromCell, paymentMethod === 'cash' && styles.paidFromCellSelected]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Text style={styles.paidFromLabel}>Cash</Text>
              {ledgerBalances && (
                <Text style={styles.paidFromBalance}>₹{Math.round(Number(ledgerBalances.cash.balance))}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paidFromCell, paymentMethod === 'bank' && styles.paidFromCellSelected]}
              onPress={() => setPaymentMethod('bank')}
            >
              <Text style={styles.paidFromLabel}>Bank / UPI</Text>
              {ledgerBalances && (
                <Text style={styles.paidFromBalance}>₹{Math.round(Number(ledgerBalances.bank.balance))}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.detailsCard}>
          <TouchableOpacity style={styles.detailRow} onPress={() => setShowSitePicker(true)}>
            <Text style={styles.detailLabel}>Site</Text>
            <Text style={styles.detailValue}>{site ? site.name : 'Not linked'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailRow} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{date ? formatDateLong(date) : 'Select date'}</Text>
          </TouchableOpacity>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Reason</Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Optional"
              placeholderTextColor={colors.textMutedB}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.balanceAfterRow}>
          <Text style={styles.balanceAfterLabel}>Balance after this payment</Text>
          <Text style={styles.balanceAfterValue}>₹{Math.round(balanceAfter)}</Text>
        </View>
        <PrimaryButton label="Save payment" onPress={handleSave} loading={createPayment.isPending} disabled={!canSave} />
      </View>

      <SitePickerModal
        visible={showSitePicker}
        sites={sites ?? []}
        currentSiteId={siteId}
        onSelect={(id) => {
          setSiteId(id);
          setShowSitePicker(false);
        }}
        onClose={() => setShowSitePicker(false)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date ? new Date(date + 'T00:00:00') : new Date()}
          mode="date"
          display="default"
          onValueChange={(_event: unknown, selected?: Date) => {
            setShowDatePicker(false);
            if (selected) setDate(toIsoDate(selected));
          }}
          onDismiss={() => setShowDatePicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 14,
  },
  backLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
  },
  title: {
    ...typography.headerLarge,
    color: colors.ink,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.cardPaddingSmall,
  },
  workerName: {
    ...typography.bodyStrong,
    fontSize: 17,
    color: colors.ink,
  },
  workerMeta: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
    marginTop: 2,
  },
  balanceDue: {
    color: colors.warningDark,
    fontFamily: fontFamily.extraBold,
  },
  balanceClear: {
    color: colors.textMutedA,
    fontFamily: fontFamily.extraBold,
  },
  amountCard: {
    gap: 14,
  },
  amountLabel: {
    ...typography.eyebrow,
    fontSize: 12,
    color: colors.greenTintDark,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 10,
  },
  rupeeSign: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    color: colors.greenTintDark,
  },
  amountInput: {
    ...typography.amountXLarge,
    color: colors.white,
    flex: 1,
    padding: 0,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quickAmountLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.greenTintLight,
  },
  selectorSection: {
    gap: 9,
  },
  selectorLabel: {
    ...typography.label,
    color: colors.textMutedB,
    textTransform: 'uppercase',
  },
  paymentTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentTypeCell: {
    flex: 1,
    borderRadius: radius.tile,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 3,
  },
  paymentTypeCellSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  paymentTypeLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.ink,
  },
  paymentTypeLabelSelected: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
  },
  paymentTypeSub: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.textMutedB,
  },
  paymentTypeSubSelected: {
    color: colors.greenTintDark,
  },
  paidFromRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paidFromCell: {
    flex: 1,
    borderRadius: radius.tile,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  paidFromCellSelected: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  paidFromLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  paidFromBalance: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textMutedA,
    marginTop: 2,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.chipBg,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textMutedA,
  },
  detailValue: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  reasonInput: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgPaper,
  },
  balanceAfterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceAfterLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textMutedA,
  },
  balanceAfterValue: {
    ...typography.amount,
    fontSize: 18,
    color: colors.ink,
  },
});
