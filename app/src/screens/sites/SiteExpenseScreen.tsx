import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useSite } from '../../api/hooks/useSites';
import { useCreateExpense, useQuickDescriptions } from '../../api/hooks/useExpenses';
import { sanitizeWholeNumberInput } from '../../utils/workerValidation';
import { formatDateLong, toIsoDate, todayIsoDate } from '../../utils/attendance';
import type { PaidBy, PaymentMethod } from '../../types/api';
import type { SitesStackParamList } from '../../navigation/SitesStack';

type Props = NativeStackScreenProps<SitesStackParamList, 'SiteExpense'>;

export function SiteExpenseScreen({ route, navigation }: Props) {
  const { siteId } = route.params;
  const { data: site, isLoading: siteLoading } = useSite(siteId);
  const { data: quickDescriptions } = useQuickDescriptions(siteId);
  const createExpense = useCreateExpense();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string | null>(todayIsoDate());
  const [paidBy, setPaidBy] = useState<PaidBy>('contractor');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canSave = Number(amount) > 0 && description.trim().length > 0 && date !== null;

  async function handleSave() {
    if (!canSave || date === null) return;
    await createExpense.mutateAsync({
      site_id: siteId,
      date,
      amount: Number(amount),
      description: description.trim(),
      paid_by: paidBy,
      payment_method: paymentMethod,
    });
    navigation.goBack();
  }

  if (siteLoading || !site) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Site expense</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.amountCard}>
          <Text style={styles.eyebrow}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(sanitizeWholeNumberInput(text))}
              placeholder="0"
              placeholderTextColor={colors.textMutedB}
              keyboardType="number-pad"
            />
          </View>
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={styles.eyebrow}>What was it for</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Excavator fuel"
            placeholderTextColor={colors.textMutedB}
          />
          {quickDescriptions && quickDescriptions.length > 0 && (
            <View style={styles.chipRow}>
              {quickDescriptions.map((desc) => (
                <TouchableOpacity key={desc} style={styles.chip} onPress={() => setDescription(desc)}>
                  <Text style={styles.chipLabel}>{desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Site</Text>
            <Text style={styles.detailValue}>{site.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.detailRow, styles.detailRowLast]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{date ? formatDateLong(date) : 'Select date'}</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.selectorPairRow}>
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Paid by</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity
                style={[styles.selectorCell, paidBy === 'contractor' && styles.selectorCellSelected]}
                onPress={() => setPaidBy('contractor')}
              >
                <Text style={[styles.selectorLabelText, paidBy === 'contractor' && styles.selectorLabelTextSelected]}>
                  Me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectorCell, paidBy === 'supervisor' && styles.selectorCellSelected]}
                onPress={() => setPaidBy('supervisor')}
              >
                <Text
                  style={[styles.selectorLabelText, paidBy === 'supervisor' && styles.selectorLabelTextSelected]}
                >
                  Supervisor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Paid from</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity
                style={[styles.selectorCell, paymentMethod === 'cash' && styles.selectorCellSelected]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Text
                  style={[styles.selectorLabelText, paymentMethod === 'cash' && styles.selectorLabelTextSelected]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectorCell, paymentMethod === 'bank' && styles.selectorCellSelected]}
                onPress={() => setPaymentMethod('bank')}
              >
                <Text
                  style={[styles.selectorLabelText, paymentMethod === 'bank' && styles.selectorLabelTextSelected]}
                >
                  Bank
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PrimaryButton label="Save expense" onPress={handleSave} loading={createExpense.isPending} disabled={!canSave} />
      </ScrollView>

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
  amountCard: {
    gap: 10,
  },
  eyebrow: {
    ...typography.label,
    fontSize: 12,
    color: colors.textMutedB,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  rupeeSign: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.textMutedB,
  },
  amountInput: {
    ...typography.amountXLarge,
    fontSize: 40,
    color: colors.ink,
    flex: 1,
    padding: 0,
  },
  descriptionCard: {
    gap: 10,
  },
  descriptionInput: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: colors.ink,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  chip: {
    backgroundColor: colors.chipBg,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.ink,
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
  selectorPairRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorSection: {
    flex: 1,
    gap: 9,
  },
  selectorLabel: {
    ...typography.label,
    color: colors.textMutedB,
    textTransform: 'uppercase',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorCell: {
    flex: 1,
    borderRadius: radius.tile,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    alignItems: 'center',
  },
  selectorCellSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  selectorLabelText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.ink,
  },
  selectorLabelTextSelected: {
    color: colors.white,
  },
});
