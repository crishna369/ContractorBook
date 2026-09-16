import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontFamily, typography } from '../../theme/typography';
import { Avatar } from '../../components/Avatar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AttendanceStatusGrid } from '../../components/AttendanceStatusGrid';
import { SitePickerModal } from '../../components/SitePickerModal';
import { useWorker } from '../../api/hooks/useWorkers';
import { useSites } from '../../api/hooks/useSites';
import { useAttendanceForDate, useSaveAttendance } from '../../api/hooks/useAttendance';
import { formatDateLong } from '../../utils/attendance';
import type { AttendanceStackParamList } from '../../navigation/AttendanceStack';

type Props = NativeStackScreenProps<AttendanceStackParamList, 'MarkAttendance'>;

type SiteRow = {
  key: number;
  siteId: string | null;
  value: number | null;
};

let rowKeySeq = 0;
function nextRowKey(): number {
  rowKeySeq += 1;
  return rowKeySeq;
}

export function MarkAttendanceSheet({ route, navigation }: Props) {
  const { workerId, date } = route.params;
  const { data: worker, isLoading: workerLoading } = useWorker(workerId);
  const { data: sites, isLoading: sitesLoading } = useSites();
  const { data: attendanceEntries, isLoading: attendanceLoading } = useAttendanceForDate(date);
  const saveAttendance = useSaveAttendance();

  const [rows, setRows] = useState<SiteRow[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [pickerRowKey, setPickerRowKey] = useState<number | null>(null);

  const existingEntries = useMemo(
    () => (attendanceEntries ?? []).filter((e) => e.worker_id === workerId),
    [attendanceEntries, workerId]
  );

  useEffect(() => {
    if (!initialized && attendanceEntries !== undefined) {
      if (existingEntries.length > 0) {
        setRows(existingEntries.map((e) => ({ key: nextRowKey(), siteId: e.site_id, value: Number(e.value) })));
      } else {
        setRows([{ key: nextRowKey(), siteId: null, value: null }]);
      }
      setInitialized(true);
    }
  }, [initialized, attendanceEntries, existingEntries]);

  const sitesById = useMemo(() => new Map((sites ?? []).map((s) => [s.id, s])), [sites]);
  const usedSiteIds = useMemo(() => new Set(rows.map((r) => r.siteId).filter((id): id is string => id !== null)), [rows]);
  const availableSitesForNewRow = (sites ?? []).filter((s) => !usedSiteIds.has(s.id));

  const dailyWage = worker ? Number(worker.daily_wage) : 0;
  const totalValue = rows.reduce((sum, r) => sum + (r.value ?? 0), 0);
  const totalCost = rows.reduce((sum, r) => sum + (r.value ?? 0) * dailyWage, 0);

  const canSave = rows.length === 0 || rows.every((r) => r.siteId !== null && r.value !== null);

  function updateRow(key: number, patch: Partial<SiteRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextRowKey(), siteId: null, value: null }]);
  }

  async function handleSave() {
    if (!canSave) return;
    const entries = rows
      .filter((r): r is SiteRow & { siteId: string; value: number } => r.siteId !== null && r.value !== null)
      .map((r) => ({ site_id: r.siteId, value: r.value }));
    await saveAttendance.mutateAsync({ worker_id: workerId, date, entries });
    navigation.goBack();
  }

  const loading = workerLoading || sitesLoading || attendanceLoading || !initialized;

  if (loading || !worker) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  const pickerRow = rows.find((r) => r.key === pickerRowKey);

  function handleSelectSite(siteId: string) {
    if (pickerRowKey !== null) updateRow(pickerRowKey, { siteId });
    setPickerRowKey(null);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.handle} />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>‹ Attendance</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Avatar name={worker.name} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>{worker.name}</Text>
            <Text style={styles.workerMeta}>
              ₹{dailyWage} per day · {formatDateLong(date)}
            </Text>
          </View>
        </View>

        {rows.map((row, index) => {
          const site = row.siteId ? sitesById.get(row.siteId) : undefined;
          return (
            <View key={row.key} style={styles.siteCard}>
              <View style={styles.siteCardHeader}>
                <Text style={styles.eyebrow}>Site {index + 1}</Text>
                {rows.length > 1 && (
                  <TouchableOpacity onPress={() => removeRow(row.key)}>
                    <Text style={styles.removeLink}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.siteNameRow} onPress={() => setPickerRowKey(row.key)}>
                <Text style={styles.siteName}>{site ? site.name : 'Select site'}</Text>
                <Text style={styles.changeLink}>{site ? 'Change' : 'Choose'}</Text>
              </TouchableOpacity>
              <AttendanceStatusGrid value={row.value} onChange={(value) => updateRow(row.key, { value })} />
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Labour cost on this site</Text>
                <Text style={styles.costValue}>₹{Math.round((row.value ?? 0) * dailyWage)}</Text>
              </View>
            </View>
          );
        })}

        {availableSitesForNewRow.length > 0 && (
          <TouchableOpacity style={styles.addSiteRow} onPress={addRow}>
            <Text style={styles.addSiteLabel}>+ Add another site</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalBanner}>
          <View>
            <Text style={styles.totalLabel}>Total for the day</Text>
            <Text style={styles.totalSubLabel}>
              {totalValue} day{rows.length > 1 ? ` across ${rows.length} sites` : ''}
            </Text>
          </View>
          <Text style={styles.totalValue}>₹{Math.round(totalCost)}</Text>
        </View>
        <PrimaryButton
          label="Save attendance"
          onPress={handleSave}
          loading={saveAttendance.isPending}
          disabled={!canSave}
        />
      </View>

      <SitePickerModal
        visible={pickerRowKey !== null}
        sites={sites ?? []}
        currentSiteId={pickerRow?.siteId}
        excludeSiteIds={usedSiteIds}
        onSelect={handleSelectSite}
        onClose={() => setPickerRowKey(null)}
      />
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
    paddingTop: 12,
    paddingBottom: 12,
    gap: 14,
  },
  backLink: {
    ...typography.bodyStrong,
    color: colors.accentGreen,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  workerName: {
    ...typography.headerLarge,
    fontSize: 19,
    color: colors.ink,
  },
  workerMeta: {
    ...typography.label,
    color: colors.textMutedA,
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 2,
  },
  siteCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 16,
    gap: 14,
  },
  siteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    ...typography.label,
    color: colors.textMutedB,
    textTransform: 'uppercase',
  },
  removeLink: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textMutedB,
  },
  siteNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.tileSmall,
    backgroundColor: colors.bgPaper,
  },
  siteName: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
  },
  changeLink: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textMutedA,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textMutedA,
  },
  costValue: {
    ...typography.amount,
    fontSize: 17,
    color: colors.ink,
  },
  addSiteRow: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radius.cardSmall,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addSiteLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textMutedA,
  },
  footer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 12,
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.greenTintLight,
    borderRadius: radius.cardSmall,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  totalLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.accentGreen,
  },
  totalSubLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.greenTintDark,
    marginTop: 2,
  },
  totalValue: {
    ...typography.amountLarge,
    fontSize: 26,
    color: colors.primaryDark,
  },
});
