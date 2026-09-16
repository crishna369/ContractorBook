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
import { useCreateBill } from '../../api/hooks/useBilling';
import { sanitizeWholeNumberInput } from '../../utils/workerValidation';
import { formatDateLong, toIsoDate, todayIsoDate } from '../../utils/attendance';
import type { SitesStackParamList } from '../../navigation/SitesStack';

type Props = NativeStackScreenProps<SitesStackParamList, 'AddBill'>;

export function AddBillScreen({ route, navigation }: Props) {
  const { siteId } = route.params;
  const { data: site, isLoading: siteLoading } = useSite(siteId);
  const createBill = useCreateBill();

  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [date, setDate] = useState<string | null>(todayIsoDate());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canSave = Number(amount) > 0 && date !== null;

  async function handleSave() {
    if (!canSave || date === null) return;
    await createBill.mutateAsync({
      site_id: siteId,
      bill_date: date,
      bill_amount: Number(amount),
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
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
          <Text style={styles.title}>Client bill</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.amountCard}>
          <Text style={styles.eyebrow}>Bill amount</Text>
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

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Site</Text>
            <Text style={styles.detailValue}>{site.name}</Text>
          </View>
          <TouchableOpacity style={styles.detailRow} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{date ? formatDateLong(date) : 'Select date'}</Text>
          </TouchableOpacity>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Remarks</Text>
            <TextInput
              style={styles.remarksInput}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Optional"
              placeholderTextColor={colors.textMutedB}
            />
          </View>
        </Card>

        <PrimaryButton label="Save bill" onPress={handleSave} loading={createBill.isPending} disabled={!canSave} />
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
  remarksInput: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.ink,
  },
});
