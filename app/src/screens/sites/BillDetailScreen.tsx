import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DateField } from '../../components/DateField';
import { EmptyState } from '../../components/EmptyState';
import { useBillDetail, useCreateReceipt } from '../../api/hooks/useBilling';
import { useSite } from '../../api/hooks/useSites';
import { formatDateLong, todayIsoDate } from '../../utils/attendance';
import { PAYMENT_METHOD_LABELS } from '../../utils/payment';
import { sanitizeWholeNumberInput } from '../../utils/workerValidation';
import type { BillReceipt, PaymentMethod } from '../../types/api';
import type { SitesStackParamList } from '../../navigation/SitesStack';

type Props = NativeStackScreenProps<SitesStackParamList, 'BillDetail'>;

function AddReceiptForm({ billId, onDone }: { billId: string; onDone: () => void }) {
  const [date, setDate] = useState<string | null>(todayIsoDate());
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const createReceipt = useCreateReceipt();

  const canSubmit = date !== null && Number(amount) > 0;

  async function handleSubmit() {
    if (!canSubmit || date === null) return;
    await createReceipt.mutateAsync({
      bill_id: billId,
      amount_received: Number(amount),
      date_received: date,
      payment_method: paymentMethod,
    });
    setAmount('');
    onDone();
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.formTitle}>Record receipt</Text>
      <DateField label="Date received" value={date} onChange={setDate} clearable={false} />
      <TextInput
        style={styles.input}
        placeholder="Amount received"
        placeholderTextColor={colors.textMutedA}
        keyboardType="number-pad"
        value={amount}
        onChangeText={(text) => setAmount(sanitizeWholeNumberInput(text))}
      />
      <View style={styles.paidFromRow}>
        <TouchableOpacity
          style={[styles.paidFromCell, paymentMethod === 'cash' && styles.paidFromCellSelected]}
          onPress={() => setPaymentMethod('cash')}
        >
          <Text style={styles.paidFromLabel}>Cash</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paidFromCell, paymentMethod === 'bank' && styles.paidFromCellSelected]}
          onPress={() => setPaymentMethod('bank')}
        >
          <Text style={styles.paidFromLabel}>Bank / UPI</Text>
        </TouchableOpacity>
      </View>
      <PrimaryButton
        label="Save receipt"
        onPress={handleSubmit}
        loading={createReceipt.isPending}
        disabled={!canSubmit}
      />
    </Card>
  );
}

function ReceiptRow({ receipt }: { receipt: BillReceipt }) {
  return (
    <Card style={styles.receiptRow}>
      <View style={styles.receiptRowTop}>
        <Text style={styles.receiptDate}>{formatDateLong(receipt.date_received)}</Text>
        <Text style={styles.receiptAmount}>₹{Math.round(Number(receipt.amount_received))}</Text>
      </View>
      <Text style={styles.receiptMeta}>{PAYMENT_METHOD_LABELS[receipt.payment_method]}</Text>
    </Card>
  );
}

export function BillDetailScreen({ route, navigation }: Props) {
  const { billId } = route.params;
  const { data: bill, isLoading, error } = useBillDetail(billId);
  const { data: site } = useSite(bill?.site_id ?? '');
  const [showAddReceiptForm, setShowAddReceiptForm] = useState(false);
  const backLabel = site ? `‹ ${site.name}` : '‹ Back';

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  if (error || !bill) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Couldn't load this bill.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const balance = Number(bill.balance);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>{backLabel}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Bill details</Text>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bill amount</Text>
            <Text style={styles.summaryValue}>₹{Math.round(Number(bill.bill_amount))}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Received</Text>
            <Text style={styles.summaryValue}>₹{Math.round(Number(bill.amount_received))}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.balanceValue, balance > 0 && styles.balanceValueDue]}>
              ₹{Math.round(balance)}
            </Text>
          </View>
          <Text style={styles.meta}>{formatDateLong(bill.bill_date)}</Text>
          {bill.remarks && <Text style={styles.meta}>{bill.remarks}</Text>}
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Receipts</Text>
          <TouchableOpacity onPress={() => setShowAddReceiptForm((v) => !v)}>
            <Text style={styles.addLink}>{showAddReceiptForm ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>
        {showAddReceiptForm && (
          <AddReceiptForm billId={billId} onDone={() => setShowAddReceiptForm(false)} />
        )}
        <View style={styles.sectionList}>
          {bill.receipts.map((receipt) => (
            <ReceiptRow key={receipt.id} receipt={receipt} />
          ))}
          {bill.receipts.length === 0 && <EmptyState label="No receipts yet" />}
        </View>
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
  error: {
    ...typography.body,
    color: colors.warningDark,
  },
  summaryCard: {
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryRowLast: {
    borderTopWidth: 1,
    borderTopColor: colors.chipBg,
    marginTop: 4,
    paddingTop: 10,
  },
  summaryLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textMutedA,
  },
  summaryValue: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  balanceValue: {
    ...typography.amountLarge,
    fontSize: 20,
    color: colors.ink,
  },
  balanceValueDue: {
    color: colors.warningDark,
  },
  meta: {
    ...typography.body,
    color: colors.textMutedA,
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
  sectionList: {
    gap: 10,
  },
  receiptRow: {
    padding: spacing.cardPaddingSmall,
    gap: 4,
  },
  receiptRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptDate: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  receiptAmount: {
    ...typography.amount,
    color: colors.ink,
  },
  receiptMeta: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
});
